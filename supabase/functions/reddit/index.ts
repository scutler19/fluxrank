// supabase/functions/reddit/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { fetchRedditMentions } from "../_shared/utils.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function processRedditQuery(query: string): Promise<{ok: boolean, mentions?: number, error?: string}> {
  try {
    console.log(`Processing Reddit query: ${query}`);
    
    // Get project_id from projects table using slug lookup
    const { data: projects, error: lookupError } = await supabase
      .from('projects')
      .select('project_id')
      .eq('project_id', query)
      .single();

    if (lookupError || !projects) {
      return { ok: false, error: `Project not found: ${query}` };
    }

    const projectId = projects.project_id;
    
    // Fetch Reddit mentions with retry logic for rate limits
    let mentions: number;
    try {
      mentions = await fetchRedditMentions(query);
    } catch (error) {
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        // Wait 30 seconds and retry once
        console.log(`Rate limit hit, waiting 30 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
        mentions = await fetchRedditMentions(query);
      } else {
        throw error;
      }
    }

    // Insert snapshot into database
    const { error: insertError } = await supabase
      .from('snapshots')
      .insert({
        project_id: projectId,
        src: 'reddit',
        mentions,
        captured_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    return { ok: true, mentions };
  } catch (error) {
    console.error(`Error processing Reddit query ${query}:`, error);
    return { ok: false, error: error.message };
  }
}

serve(async (req) => {
  try {
    console.log("Reddit request received");
    
    // Handle POST requests for batch mode
    if (req.method === 'POST') {
      const body = await req.json();
      const { mode, packages } = body;
      
      if (mode === 'batch' && packages && Array.isArray(packages)) {
        const results = [];
        for (const pkg of packages) {
          try {
            const result = await processRedditQuery(pkg);
            results.push({ project_id: pkg, ...result });
          } catch (error) {
            results.push({ project_id: pkg, ok: false, error: error.message });
          }
        }
        
        return new Response(JSON.stringify({ ok: true, results }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle GET requests for single query or all projects
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    console.log(`Query: ${query}`);

    if (query) {
      // Process single query
      const result = await processRedditQuery(query);
      const status = result.ok ? 200 : 400;
      console.log(`Single query result:`, result);
      return new Response(JSON.stringify(result), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Process all projects
      const { data: projects, error } = await supabase
        .from('projects')
        .select('project_id');

      if (error) {
        return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!projects || projects.length === 0) {
        return new Response(JSON.stringify({ ok: true, message: "No projects found" }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Process each project directly
      const results = [];
      for (const project of projects) {
        try {
          const result = await processRedditQuery(project.project_id);
          results.push({ project_id: project.project_id, ...result });
        } catch (error) {
          results.push({ project_id: project.project_id, ok: false, error: error.message });
        }
      }

      return new Response(JSON.stringify({ ok: true, results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

/*
Smoke test:
curl "http://localhost:54321/functions/v1/reddit?q=supabase"
# => 200 { ok:true, mentions: <number> }
*/ 