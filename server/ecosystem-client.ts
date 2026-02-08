import * as crypto from "crypto";

const BASE_URL = "https://paintpros.io/api";
const APP_NAME = "TrustHome";

export function getTenantId(): string {
  return process.env.TRUSTHOME_TENANT_ID || "demo";
}

function generateSignature(apiKey: string, apiSecret: string): { timestamp: string; signature: string } {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(`${timestamp}:${apiKey}`)
    .digest("hex");
  return { timestamp, signature };
}

export function getAuthHeaders(): Record<string, string> {
  const apiKey = process.env.ORBIT_ECOSYSTEM_API_KEY || "";
  const apiSecret = process.env.ORBIT_ECOSYSTEM_API_SECRET || "";
  const { timestamp, signature } = generateSignature(apiKey, apiSecret);

  return {
    "Content-Type": "application/json",
    "Authorization": `DW ${apiKey}:${timestamp}:${signature}`,
    "X-App-Name": APP_NAME,
  };
}

export function getDarkWaveHeaders(): Record<string, string> {
  const apiKey = process.env.DARKWAVE_API_KEY || "";
  const apiSecret = process.env.DARKWAVE_API_SECRET || "";
  const { timestamp, signature } = generateSignature(apiKey, apiSecret);

  return {
    "Content-Type": "application/json",
    "Authorization": `DW ${apiKey}:${timestamp}:${signature}`,
    "X-App-Name": APP_NAME,
  };
}

export async function ecosystemGet(
  endpoint: string,
  params?: Record<string, string>
): Promise<any> {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set("tenantId", getTenantId());
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`ecosystemGet [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from upstream (${response.status})`, notAvailable: true };
    }

    return await response.json();
  } catch (error) {
    console.error(`ecosystemGet error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function ecosystemPost(
  endpoint: string,
  body: Record<string, any>
): Promise<any> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const payload = { ...body, tenantId: getTenantId() };

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`ecosystemPost [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from upstream (${response.status})`, notAvailable: true };
    }

    return await response.json();
  } catch (error) {
    console.error(`ecosystemPost error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function ecosystemPut(
  endpoint: string,
  body: Record<string, any>
): Promise<any> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const payload = { ...body, tenantId: getTenantId() };

    const response = await fetch(url, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`ecosystemPut [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from upstream (${response.status})`, notAvailable: true };
    }

    return await response.json();
  } catch (error) {
    console.error(`ecosystemPut error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function ecosystemDelete(endpoint: string): Promise<any> {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.set("tenantId", getTenantId());

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`ecosystemDelete [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from upstream (${response.status})`, notAvailable: true };
    }

    return await response.json();
  } catch (error) {
    console.error(`ecosystemDelete error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}
