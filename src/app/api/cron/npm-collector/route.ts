export async function POST() {
  const res = await fetch('https://nlyntfrhzghdyuohawne.functions.supabase.co/npm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export const GET = POST; 