export async function POST() {
  // TEMP: Log the key length (never log the full key in production)
  console.log('SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);

  const res = await fetch('https://nlyntfrhzghdyuohawne.supabase.co/functions/v1/discover', {
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