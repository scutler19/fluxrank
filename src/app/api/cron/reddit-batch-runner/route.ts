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

  // Fire-and-forget: trigger all batches, do not await responses
  for (let offset = 0; offset < total; offset += BATCH_SIZE) {
    const url = `https://www.fluxrank.io/api/cron/reddit-collector?limit=${BATCH_SIZE}&offset=${offset}`;
    // Fire and forget
    fetch(url, { method: 'GET' });
    await new Promise(r => setTimeout(r, 500)); // small delay to avoid rate limits
  }

  return new Response(JSON.stringify({ ok: true, message: 'Batches triggered', total, batchSize: BATCH_SIZE }), { status: 200 });
}

export const GET = POST; 