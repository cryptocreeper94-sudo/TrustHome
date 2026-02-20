import * as crypto from "crypto";

const APP_NAME = "TrustHome";

function getBaseUrl(): string {
  return process.env.ARBORAI_BASE_URL || "";
}

function isConfigured(): boolean {
  return !!(process.env.ARBORAI_API_KEY && process.env.ARBORAI_API_SECRET && process.env.ARBORAI_BASE_URL);
}

function generateSignature(): { timestamp: string; signature: string } {
  const apiKey = process.env.ARBORAI_API_KEY || "";
  const apiSecret = process.env.ARBORAI_API_SECRET || "";
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(`${timestamp}:${apiKey}`)
    .digest("hex");
  return { timestamp, signature };
}

function getHeaders(): Record<string, string> {
  const apiKey = process.env.ARBORAI_API_KEY || "";
  const { timestamp, signature } = generateSignature();
  return {
    "Content-Type": "application/json",
    "Authorization": `DW ${apiKey}:${timestamp}:${signature}`,
    "X-App-Name": APP_NAME,
  };
}

export function arboraiIsConfigured(): boolean {
  return isConfigured();
}

export async function arboraiGet(endpoint: string, params?: Record<string, string>): Promise<any> {
  if (!isConfigured()) {
    return { error: "ArborAI integration not configured", notAvailable: true };
  }
  try {
    const url = new URL(`${getBaseUrl()}${endpoint}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getHeaders(),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`arboraiGet [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from ArborAI (${response.status})`, notAvailable: true };
    }
    return await response.json();
  } catch (error) {
    console.error(`arboraiGet error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function arboraiPost(endpoint: string, body: Record<string, any>): Promise<any> {
  if (!isConfigured()) {
    return { error: "ArborAI integration not configured", notAvailable: true };
  }
  try {
    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`arboraiPost [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from ArborAI (${response.status})`, notAvailable: true };
    }
    return await response.json();
  } catch (error) {
    console.error(`arboraiPost error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function arboraiStatus(): Promise<any> {
  return arboraiGet("/api/ecosystem/status");
}

export async function arboraiIdentify(imageData: string, location?: { lat: number; lng: number }): Promise<any> {
  return arboraiPost("/api/ecosystem/identify", { imageData, location });
}

export async function arboraiRemovalPlan(propertyAddress: string, treeIds: string[]): Promise<any> {
  return arboraiPost("/api/ecosystem/removal-plan", { propertyAddress, treeIds });
}

export async function arboraiAssess(propertyAddress: string, agentId: string): Promise<any> {
  return arboraiPost("/api/ecosystem/assess", { propertyAddress, agentId });
}

export async function arboraiGetSpecies(speciesId: string): Promise<any> {
  return arboraiGet(`/api/ecosystem/species/${speciesId}`);
}
