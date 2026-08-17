const Groq = require('groq-sdk');
const env = require('../config/env');

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

/**
 * Send a prompt to Groq and return parsed JSON.
 */
async function callLLMForJSON(systemPrompt, userPrompt) {
  if (!env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY_MISSING');
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.2,
      response_format: {
        type: 'json_object',
      },
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('EMPTY_LLM_RESPONSE');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('[AI] Groq request failed:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    });

    throw new Error('LLM_CALL_FAILED');
  }
}

module.exports = {
  callLLMForJSON,
};