import WebSocket from 'ws';

function getApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }
  return apiKey;
}

export async function getElevenLabsApiKey(): Promise<string> {
  return getApiKey();
}

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const apiKey = getApiKey();
  console.log('[ElevenLabs] Starting transcription...');

  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(audioBuffer)]), filename);
  formData.append('model_id', 'scribe_v1');

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`ElevenLabs STT failed (${response.status}): ${errText || response.statusText}`);
  }

  const result = await response.json();
  console.log('[ElevenLabs] Transcription complete:', result.text?.slice(0, 50));
  return result.text;
}

export async function textToSpeechRest(text: string, voiceId: string): Promise<Buffer> {
  const apiKey = getApiKey();
  console.log('[ElevenLabs] TTS REST request for', text.length, 'chars');

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${errText || response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log('[ElevenLabs] TTS complete, audio size:', arrayBuffer.byteLength);
  return Buffer.from(arrayBuffer);
}

export function createStreamingTTS(
  voiceId: string,
  onAudioChunk: (base64: string) => void
): Promise<{ send: (text: string) => void; flush: () => void; close: () => Promise<void> }> {
  return new Promise(async (resolve, reject) => {
    try {
      const apiKey = getApiKey();
      console.log('[ElevenLabs] Opening TTS WebSocket...');

      const uri = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=eleven_flash_v2_5&output_format=pcm_16000`;

      const websocket = new WebSocket(uri, {
        headers: { 'xi-api-key': apiKey },
      });

      let closeResolve: (() => void) | null = null;
      let isOpen = false;

      const timeout = setTimeout(() => {
        if (!isOpen) {
          websocket.terminate();
          reject(new Error('ElevenLabs WebSocket connection timed out'));
        }
      }, 10000);

      websocket.on('error', (err: Error) => {
        console.error('[ElevenLabs] WebSocket error:', err.message);
        clearTimeout(timeout);
        if (!isOpen) reject(err);
        if (closeResolve) closeResolve();
      });

      websocket.on('close', () => {
        console.log('[ElevenLabs] WebSocket closed');
        if (closeResolve) closeResolve();
      });

      websocket.on('open', () => {
        isOpen = true;
        clearTimeout(timeout);
        console.log('[ElevenLabs] WebSocket connected');

        websocket.send(JSON.stringify({
          text: ' ',
          voice_settings: { stability: 0.5, similarity_boost: 0.8, use_speaker_boost: false },
          generation_config: { chunk_length_schedule: [120, 160, 250, 290] },
        }));

        resolve({
          send: (text: string) => {
            if (websocket.readyState === WebSocket.OPEN) {
              websocket.send(JSON.stringify({ text }));
            }
          },
          flush: () => {
            if (websocket.readyState === WebSocket.OPEN) {
              websocket.send(JSON.stringify({ text: ' ', flush: true }));
            }
          },
          close: () => {
            return new Promise<void>((res) => {
              closeResolve = res;
              if (websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({ text: '' }));
                setTimeout(() => {
                  websocket.close();
                  setTimeout(res, 200);
                }, 2000);
              } else {
                res();
              }
            });
          },
        });
      });

      websocket.on('message', (event: WebSocket.Data) => {
        try {
          const data = JSON.parse(event.toString());
          if (data.audio) {
            onAudioChunk(data.audio);
          }
        } catch (e) {
          console.error('[ElevenLabs] Failed to parse message:', e);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
