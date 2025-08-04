export default async function handler(req, res) {
    console.log('Proxy got body:', req.body);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    //const hfRes = await fetch('https://jwwylie1-pitwall-ai.hf.space/generate', {
    const hfRes = await fetch('http://localhost:7860/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body),
    });

    const data = await hfRes.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Proxy failed' });
  }
}