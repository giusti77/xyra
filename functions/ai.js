const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, transactions } = JSON.parse(event.body);
    // Usando a chave do DeepSeek configurada no Netlify
    const apiKey = process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.trim() : null;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ reply: 'Erro: Chave DeepSeek não encontrada no Netlify.' }) };
    }

    const systemPrompt = `Você é a Xyra, uma consultora financeira de elite e copiloto inteligente do ecossistema GST (Growth System Technology).
Sua missão é ajudar o usuário a dominar suas finanças com precisão, clareza e insights estratégicos.

DIRETRIZES DE PERSONALIDADE:
1. Seja analítica e proativa. Não apenas responda, sugira melhorias.
2. Use um tom profissional, porém encorajador (Elite Fintech Style).
3. Ao analisar transações, identifique padrões de gastos desnecessários ou oportunidades de economia.

DIRETRIZES DE FORMATAÇÃO:
- Use **negrito** para destacar valores e conceitos importantes.
- Use listas (bullet points) para organizar múltiplos insights.
- Mantenha parágrafos curtos e diretos.

DADOS DO USUÁRIO: ${JSON.stringify(transactions || [])}`;

    const postData = JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      stream: false
    });

    const options = {
      hostname: 'api.deepseek.com',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => responseBody += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            if (res.statusCode === 200) {
              const reply = parsed.choices[0].message.content;
              resolve({
                statusCode: 200,
                body: JSON.stringify({ reply }),
              });
            } else {
              console.error('DeepSeek API Error Detail:', responseBody);
              resolve({
                statusCode: res.statusCode,
                body: JSON.stringify({ reply: "Erro na API do DeepSeek: " + (parsed.error?.message || res.statusCode) }),
              });
            }
          } catch (e) {
            resolve({ statusCode: 500, body: JSON.stringify({ reply: 'Erro ao processar resposta do DeepSeek.' }) });
          }
        });
      });

      req.on('error', (e) => {
        console.error('Request error:', e);
        resolve({ statusCode: 500, body: JSON.stringify({ reply: 'Erro na requisição ao DeepSeek.' }) });
      });
      
      req.write(postData);
      req.end();
    });

  } catch (error) {
    console.error('Internal error:', error);
    return { statusCode: 500, body: JSON.stringify({ reply: 'Erro interno no servidor.' }) };
  }
};
