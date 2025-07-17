const BATCH_SIZE = 5;

export async function POST() {
  // 1. Get total number of projects from Supabase
  const res = await fetch('https://nlyntfrhzghdyuohawne.supabase.co/rest/v1/projects?select=project_id', {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
    }
  });
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch projects', status: res.status }), { status: 500 });
  }
  const projects = await res.json();
  const total = projects.length;

  const results: object[] = [];
  for (let offset = 0; offset < total; offset += BATCH_SIZE) {
    const url = `https://www.fluxrank.io/api/cron/reddit-collector?limit=${BATCH_SIZE}&offset=${offset}`;
    console.log(`Calling batch: ${url}`);
    const batchRes = await fetch(url, { method: 'GET' });
    let batchData;
    try {
      batchData = await batchRes.json();
    } catch {
      batchData = { error: 'Non-JSON response', status: batchRes.status };
    }
    results.push({ offset, status: batchRes.status, url, ...batchData });
    // Optional: delay between batches to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  return new Response(JSON.stringify({ ok: true, total, batchSize: BATCH_SIZE, results }), { status: 200 });
}

export const GET = POST; 