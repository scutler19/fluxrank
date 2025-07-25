export async function POST() {
  const res = await fetch('https://nlyntfrhzghdyuohawne.supabase.co/functions/v1/npm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  let data;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: 'Non-JSON response', body: text, status: res.status };
  }

  return new Response(JSON.stringify(data), { status: res.status });
}

export const GET = POST; 