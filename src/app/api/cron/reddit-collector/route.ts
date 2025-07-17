export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.search; // includes ?limit=5&offset=0 if present

  const res = await fetch(
    `https://nlyntfrhzghdyuohawne.supabase.co/functions/v1/reddit${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  let data;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: 'Non-JSON response', body: text, status: res.status };
  }

  return new Response(JSON.stringify(data), { status: res.status });
}

export const POST = GET; 