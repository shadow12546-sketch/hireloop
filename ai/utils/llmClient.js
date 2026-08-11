const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Calls Groq's LLM with a system + user prompt, expects a JSON response.
 * Falls back to a second attempt if the first call fails or times out.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<object>} parsed JSON object
 */
async function callLLMForJSON(systemPrompt, userPrompt) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Groq call failed:", err.message);
    throw new Error("LLM_CALL_FAILED");
  }
}

module.exports = { callLLMForJSON };
