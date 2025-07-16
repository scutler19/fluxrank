export async function POST() {
  const res = await fetch('https://nlyntfrhzghdyuohawne.functions.supabase.co/npm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  let data;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    // Not JSON, return raw text for debugging
    data = { error: 'Non-JSON response', body: text, status: res.status };
  }

  return new Response(JSON.stringify(data), { status: res.status });
}

export const GET = POST; 