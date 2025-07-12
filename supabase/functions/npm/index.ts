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

async function processPackage(packageName: string): Promise<{ok: boolean, downloads?: number, error?: string}> {
  try {
    console.log(`Processing package: ${packageName}`);
    
    // Fetch npm data with retry logic for rate limits
    let downloads: number;
    try {
      downloads = await fetchDownloads(packageName);
    } catch (error) {
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        // Wait 30 seconds and retry once
        console.log(`Rate limit hit, waiting 30 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
        downloads = await fetchDownloads(packageName);
      } else {
        throw error;
      }
    }

    // Insert snapshot into database
    const { error: insertError } = await supabase
      .from('snapshots')
      .insert({
        project_id: packageName,
        src: 'npm',
        downloads,
        captured_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    return { ok: true, downloads };
  } catch (error) {
    console.error(`Error processing ${packageName}:`, error);
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
        const results = [];
        for (const pkg of packages) {
          const result = await processPackage(pkg);
          results.push({ package: pkg, ...result });
        }
        
        return new Response(JSON.stringify({ ok: true, results }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle GET requests for single package or all packages
    const url = new URL(req.url);
    const packageName = url.searchParams.get('package');
    console.log(`Package name: ${packageName}`);

    if (packageName) {
      // Process single package
      const result = await processPackage(packageName);
      const status = result.ok ? 200 : 400;
      console.log(`Single package result:`, result);
      return new Response(JSON.stringify(result), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Process all npm packages (those without slashes)
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

      // Filter for npm packages (no slashes)
      const npmPackages = projects
        .map(p => p.project_id)
        .filter(id => !id.includes('/'));

      if (npmPackages.length === 0) {
        return new Response(JSON.stringify({ ok: true, message: "No npm packages found" }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Process each npm package
      const results = [];
      for (const packageName of npmPackages) {
        const result = await processPackage(packageName);
        results.push({ package: packageName, ...result });
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
curl "http://localhost:54321/functions/v1/npm?package=supabase"
# => 200 { ok:true, downloads: ##### }
*/ 