export async function POST(request) {
  try {
    const { message, transactions } = await request.json();
    
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-9df3bf8dffb5491c92a0567f7daaf965';
    
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
            content: 'Você é um assistente financeiro especializado. Seja amigável.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Erro ao processar';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
