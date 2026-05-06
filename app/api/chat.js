export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, transactions } = req.body;

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-9df3bf8dffb5491c92a0567f7daaf965';
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente financeiro especializado. Seja amigável e ofereça insights úteis.'
          },
          {
            role: 'user',
            content: `${message}\n\nTransações: ${JSON.stringify(transactions || [])}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek error:', error);
      return res.status(response.status).json({ error: error });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Erro ao processar';

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
