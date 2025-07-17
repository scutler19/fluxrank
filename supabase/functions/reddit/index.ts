// supabase/functions/reddit/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { fetchRedditMentions } from "../_shared/utils.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function processRedditQuery(query: string): Promise<{ok: boolean, mentions?: number, error?: string, debug?: any}> {
  try {
    console.log(`Processing Reddit query: ${query}`);
    
    // Get project_id and name from projects table
    const { data: project, error: lookupError } = await supabase
      .from('projects')
      .select('project_id, name')
      .eq('project_id', query)
      .single();

    if (lookupError || !project) {
      console.error(`Project lookup failed for ${query}:`, lookupError);
      return { ok: false, error: `Project not found: ${query}` };
    }

    const projectId = project.project_id;
    const projectName = project.name;

    // Build search terms: project_id, last segment, project name
    const terms = [projectId];
    if (projectId.includes('/')) {
      const parts = projectId.split('/');
      terms.push(parts[0]);
      terms.push(parts[1]);
    }
    if (projectId.startsWith('@')) {
      // For scoped npm packages, add the unscoped part
      const unscoped = projectId.split('/').pop();
      if (unscoped) terms.push(unscoped);
    }
    if (projectName && !terms.includes(projectName)) {
      terms.push(projectName);
    }

    // Remove duplicates and empty strings
    const uniqueTerms = Array.from(new Set(terms.filter(Boolean)));
    console.log(`[Reddit] Search terms for ${projectId}:`, uniqueTerms);

    // Fetch Reddit mentions with retry logic for rate limits and timeout
    let mentions: number = 0;
    let debugInfo: any = {};
    async function fetchWithTimeout(fn: () => Promise<number>, ms: number) {
      return Promise.race([
        fn(),
        new Promise<number>((_, reject) => setTimeout(() => reject(new Error('Reddit API timeout')), ms))
      ]);
    }
    try {
      mentions = await fetchWithTimeout(() => fetchRedditMentions(uniqueTerms), 20000);
    } catch (error) {
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        console.log(`Rate limit hit, waiting 30 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
        mentions = await fetchWithTimeout(() => fetchRedditMentions(uniqueTerms), 20000);
      } else {
        console.error(`[Reddit] API error for ${projectId}:`, error);
        throw error;
      }
    }
    debugInfo.terms = uniqueTerms;
    debugInfo.mentions = mentions;
    console.log(`[Reddit] Mentions for ${projectId}:`, mentions, 'Debug:', debugInfo);

    // Insert snapshot into database
    const { data: insertData, error: insertError } = await supabase
      .from('snapshots')
      .insert({
        project_id: projectId,
        src: 'reddit',
        mentions,
        captured_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error(`[DB] Insert error for ${projectId}:`, insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }
    console.log(`[DB] Inserted snapshot for ${projectId}:`, insertData);

    return { ok: true, mentions, debug: debugInfo };
  } catch (error) {
    console.error(`Error processing Reddit query ${query}:`, error);
    return { ok: false, error: error.message };
  }
}

serve(async (req) => {
  try {
    console.log("Reddit request received");
    console.log(`Request method: ${req.method}, URL: ${req.url}`);
    let limit: number | undefined;
    let offset: number | undefined;
    if (req.method === 'POST') {
      let body = {};
      try {
        body = await req.json();
        console.log('POST body:', body);
      } catch (e) {
        console.error('Failed to parse POST body:', e);
        body = {};
      }
      const { mode, packages, limit: bodyLimit, offset: bodyOffset } = body as any;
      limit = typeof bodyLimit === 'number' ? bodyLimit : undefined;
      offset = typeof bodyOffset === 'number' ? bodyOffset : undefined;
      console.log(`[Collector] POST received with limit=${limit}, offset=${offset}`);
      if (mode === 'batch' && packages && Array.isArray(packages)) {
        const results: { project_id: string, ok: boolean, mentions?: number, error?: string, debug?: any }[] = [];
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
      } else {
        // If POST body is empty or {}, process all projects (with batching if specified)
        console.log('No batch mode or packages specified. Processing all projects.');
        const { data: projects, error } = await supabase
          .from('projects')
          .select('project_id');
        if (error) {
          console.error('[DB] Error fetching projects:', error);
          return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        if (!projects || projects.length === 0) {
          console.log('No projects found in database.');
          return new Response(JSON.stringify({ ok: true, message: "No projects found" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        // Apply batching if limit/offset provided
        let batchProjects = projects;
        if (typeof limit === 'number' || typeof offset === 'number') {
          batchProjects = projects.slice(offset || 0, (offset || 0) + (limit || projects.length));
          console.log(`Processing batch: offset=${offset || 0}, limit=${limit || projects.length}, total in batch=${batchProjects.length}`);
        } else {
          console.log(`Processing all ${projects.length} projects...`);
        }
        const results: { project_id: string, ok: boolean, mentions?: number, error?: string, debug?: any }[] = [];
        for (const project of batchProjects) {
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
    }
    // Handle GET requests for single query or all projects (with batching)
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : limit;
    offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : offset;
    console.log(`[Collector] Query params: limit=${limit}, offset=${offset}`);
    if (query) {
      const result = await processRedditQuery(query);
      const status = result.ok ? 200 : 400;
      console.log(`Single query result:`, result);
      return new Response(JSON.stringify(result), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Process all projects (GET fallback, with batching)
      const { data: projects, error } = await supabase
        .from('projects')
        .select('project_id');
      if (error) {
        console.error('[DB] Error fetching projects:', error);
        return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (!projects || projects.length === 0) {
        console.log('No projects found in database.');
        return new Response(JSON.stringify({ ok: true, message: "No projects found" }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Apply batching if limit/offset provided
      let batchProjects = projects;
      if (typeof limit === 'number' || typeof offset === 'number') {
        batchProjects = projects.slice(offset || 0, (offset || 0) + (limit || projects.length));
        console.log(`Processing batch: offset=${offset || 0}, limit=${limit || projects.length}, total in batch=${batchProjects.length}`);
      } else {
        console.log(`Processing all ${projects.length} projects (GET fallback)...`);
      }
      const results: { project_id: string, ok: boolean, mentions?: number, error?: string, debug?: any }[] = [];
      for (const project of batchProjects) {
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
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
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