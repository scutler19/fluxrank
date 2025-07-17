// supabase/functions/npm/index.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { supabase } from "../_shared/supabaseClient.ts";

async function fetchDownloads(packageName: string): Promise<number> {
  const url = `https://api.npmjs.org/downloads/point/last-week/${packageName}`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "FluxRank-NPM-Collector"
    }
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    if (response.status === 404) {
      throw new Error(`Package ${packageName} not found`);
    }
    throw new Error(`NPM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.downloads || 0;
}

async function processPackage(project: { project_id: string, npm_package: string }): Promise<{ok: boolean, downloads?: number, error?: string}> {
  try {
    const { project_id, npm_package } = project;
    if (!npm_package) {
      return { ok: false, error: `No npm_package for project_id: ${project_id}` };
    }
    console.log(`Processing project: ${project_id} (npm: ${npm_package})`);
    // Fetch npm data with retry logic for rate limits
    let downloads: number;
    try {
      downloads = await fetchDownloads(npm_package);
    } catch (error) {
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        // Wait 30 seconds and retry once
        console.log(`Rate limit hit, waiting 30 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
        downloads = await fetchDownloads(npm_package);
      } else {
        throw error;
      }
    }
    // Insert snapshot into database using project_id (GitHub slug)
    const { error: insertError } = await supabase
      .from('snapshots')
      .insert({
        project_id,
        src: 'npm',
        downloads,
        captured_at: new Date().toISOString()
      });
    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }
    return { ok: true, downloads };
  } catch (error) {
    console.error(`Error processing ${project.project_id}:`, error);
    return { ok: false, error: error.message };
  }
}

serve(async (req) => {
  try {
    console.log("NPM request received");
    // Handle POST requests for batch mode
    if (req.method === 'POST') {
      const body = await req.json();
      const { mode, packages } = body;
      if (mode === 'batch' && packages && Array.isArray(packages)) {
        // Fetch project_id and npm_package for each requested package
        const { data: projects, error } = await supabase
          .from('projects')
          .select('project_id, npm_package')
          .in('project_id', packages);
        if (error) {
          return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const results: any[] = [];
        for (const project of projects) {
          const result = await processPackage(project);
          results.push({ project_id: project.project_id, ...result });
        }
        return new Response(JSON.stringify({ ok: true, results }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    // Handle GET requests for all npm projects
    const url = new URL(req.url);
    const packageName = url.searchParams.get('package');
    if (packageName) {
      // Fetch project by npm_package
      const { data: project, error } = await supabase
        .from('projects')
        .select('project_id, npm_package')
        .eq('npm_package', packageName)
        .single();
      if (error || !project) {
        return new Response(JSON.stringify({ error: `Project not found for npm_package: ${packageName}` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const result = await processPackage(project);
      const status = result.ok ? 200 : 400;
      return new Response(JSON.stringify(result), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Process all projects with an npm_package
      const { data: projects, error } = await supabase
        .from('projects')
        .select('project_id, npm_package')
        .not('npm_package', 'is', null);
      if (error) {
        return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (!projects || projects.length === 0) {
        return new Response(JSON.stringify({ ok: true, message: "No projects with npm_package found" }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const results: any[] = [];
      for (const project of projects) {
        const result = await processPackage(project);
        results.push({ project_id: project.project_id, ...result });
      }
      return new Response(JSON.stringify({ ok: true, results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in NPM function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

/*
Smoke test:
curl "http://localhost:54321/functions/v1/npm?package=supabase"
# => 200 { ok:true, downloads: ##### }
*/ 