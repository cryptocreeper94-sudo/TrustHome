import * as crypto from "crypto";

/**
 * HMAC headers for calling DarkWave Trust Layer (dwsc.io) services.
 * Uses DARKWAVE_API_KEY / DARKWAVE_API_SECRET.
 */
export function getDarkWaveHeaders(): Record<string, string> {
  const apiKey = process.env.DARKWAVE_API_KEY || "";
  const apiSecret = process.env.DARKWAVE_API_SECRET || "";
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac("sha256", apiSecret).update(`${timestamp}:${apiKey}`).digest("hex");
  return {
    "Content-Type": "application/json",
    "Authorization": `DW ${apiKey}:${timestamp}:${signature}`,
    "X-App-Name": "TrustHome",
  };
}
