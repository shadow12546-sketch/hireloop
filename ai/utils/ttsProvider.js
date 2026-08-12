const axios = require("axios");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

// A default ElevenLabs voice ID (Rachel). Swap for any voice ID from your
// ElevenLabs "Voices" tab via the ELEVENLABS_VOICE_ID env var.
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

/**
 * Converts text to speech using ElevenLabs. Returns base64 audio on success.
 * On any failure (missing key, quota exceeded, network error, timeout),
 * returns { useBrowserTTS: true } instead of throwing — so the interview
 * never breaks over a TTS issue, it just falls back to the browser's
 * built-in SpeechSynthesis on the frontend.
 */
async function generateSpeech(text) {
  if (!ELEVENLABS_API_KEY) {
    return { audioBase64: null, useBrowserTTS: true, reason: "no-api-key" };
  }

  try {
    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${DEFAULT_VOICE_ID}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        timeout: 8000,
      }
    );

    const audioBase64 = Buffer.from(response.data).toString("base64");
    return { audioBase64, useBrowserTTS: false };
  } catch (err) {
    console.warn("ElevenLabs TTS failed, falling back to browser voice:", err.message);
    return { audioBase64: null, useBrowserTTS: true, reason: "api-error" };
  }
}

module.exports = { generateSpeech };
