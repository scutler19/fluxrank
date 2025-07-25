// supabase/functions/github/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { fetchStars } from "../_shared/utils.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function processProject(projectSlug: string): Promise<{ok: boolean, stars?: number, forks?: number, error?: string}> {
  try {
    console.log(`Processing project: ${projectSlug}`);
    console.log(`GITHUB_TOKEN exists: ${!!Deno.env.get("GITHUB_TOKEN")}`);
    
    const [owner, repo] = projectSlug.split('/');
    if (!owner || !repo) {
      return { ok: false, error: "Invalid project_slug format. Expected 'owner/repo'" };
    }

    // Fetch GitHub data with retry logic for rate limits
    let stars: number, forks: number;
    try {
      const result = await fetchStars(owner, repo);
      stars = result.stars;
      forks = result.forks;
    } catch (error) {
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        // Wait 30 seconds and retry once
        await new Promise(resolve => setTimeout(resolve, 30000));
        const retryResult = await fetchStars(owner, repo);
        stars = retryResult.stars;
        forks = retryResult.forks;
      } else {
        throw error;
      }
    }

    // Insert snapshot into database
    const { error: insertError } = await supabase
      .from('snapshots')
      .insert({
        project_id: projectSlug,
        src: 'github',
        stars,
        forks,
        captured_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    return { ok: true, stars, forks };
  } catch (error) {
    console.error(`Error processing ${projectSlug}:`, error);
    return { ok: false, error: error.message };
  }
}

serve(async (req) => {
  try {
    console.log("Request received");
    
    // Handle POST requests for batch mode
    if (req.method === 'POST') {
      const body = await req.json();
      const { mode, packages } = body;
      
      if (mode === 'batch' && packages && Array.isArray(packages)) {
        // Package name to GitHub repo mapping
        const packageToRepo: Record<string, string> = {
          'react': 'facebook/react',
          'vue': 'vuejs/vue',
          'angular': 'angular/angular',
          'next': 'vercel/next.js',
          'nuxt': 'nuxt/nuxt',
          'svelte': 'sveltejs/svelte',
          'express': 'expressjs/express',
          'fastify': 'fastify/fastify',
          'prisma': 'prisma/prisma',
          'typeorm': 'typeorm/typeorm',
          'supabase': 'supabase/supabase'
        };
        
        const results = [];
        for (const pkg of packages) {
          const repoSlug = packageToRepo[pkg] || pkg;
          const result = await processProject(repoSlug);
          results.push({ project_id: repoSlug, ...result });
        }
        
        return new Response(JSON.stringify({ ok: true, results }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle GET requests for single project or all projects
    const url = new URL(req.url);
    const projectSlug = url.searchParams.get('project_slug');
    console.log(`Project slug: ${projectSlug}`);

    if (projectSlug) {
      // Process single project
      const result = await processProject(projectSlug);
      const status = result.ok ? 200 : 400;
      console.log(`Single project result:`, result);
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

      // Process each project
      const results = [];
      for (const project of projects) {
        const result = await processProject(project.project_id);
        results.push({ project_id: project.project_id, ...result });
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
curl "http://localhost:54321/functions/v1/github?project_slug=supabase/supabase"
# => 200 { ok:true, stars:..., forks:... }
*/
