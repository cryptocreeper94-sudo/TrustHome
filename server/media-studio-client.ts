import * as crypto from "crypto";

const APP_NAME = "trusthome";
const TENANT_ID = "trusthome";

function getBaseUrl(): string {
  return process.env.TRUSTVAULT_BASE_URL
    ? `${process.env.TRUSTVAULT_BASE_URL}/api/ecosystem`
    : "https://trustvault.replit.app/api/ecosystem";
}

function isConfigured(): boolean {
  return !!(process.env.DW_MEDIA_API_KEY && process.env.DW_MEDIA_API_SECRET);
}

function generateSignature(): { timestamp: string; signature: string } {
  const apiKey = process.env.DW_MEDIA_API_KEY || "";
  const apiSecret = process.env.DW_MEDIA_API_SECRET || "";
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(`${timestamp}:${apiKey}`)
    .digest("hex");
  return { timestamp, signature };
}

function getHeaders(): Record<string, string> {
  const apiKey = process.env.DW_MEDIA_API_KEY || "";
  const { timestamp, signature } = generateSignature();
  return {
    "Content-Type": "application/json",
    "Authorization": `DW ${apiKey}:${timestamp}:${signature}`,
    "X-App-Name": APP_NAME,
  };
}

export function mediaStudioIsConfigured(): boolean {
  return isConfigured();
}

export async function mediaStudioGet(endpoint: string, params?: Record<string, string>): Promise<any> {
  if (!isConfigured()) {
    return { error: "Media Studio integration not configured", notAvailable: true };
  }
  try {
    const url = new URL(`${getBaseUrl()}${endpoint}`);
    url.searchParams.set("tenantId", TENANT_ID);
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
      console.warn(`mediaStudioGet [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from TrustVault (${response.status})`, notAvailable: true };
    }
    return await response.json();
  } catch (error) {
    console.error(`mediaStudioGet error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function mediaStudioPost(endpoint: string, body: Record<string, any>): Promise<any> {
  if (!isConfigured()) {
    return { error: "Media Studio integration not configured", notAvailable: true };
  }
  try {
    const url = `${getBaseUrl()}${endpoint}`;
    const payload = { ...body, tenantId: TENANT_ID };
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`mediaStudioPost [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from TrustVault (${response.status})`, notAvailable: true };
    }
    return await response.json();
  } catch (error) {
    console.error(`mediaStudioPost error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function mediaStudioStatus(): Promise<any> {
  return mediaStudioGet("/status");
}

export async function mediaStudioListProjects(): Promise<any> {
  return mediaStudioGet("/projects");
}

export async function mediaStudioGetProject(projectId: string): Promise<any> {
  return mediaStudioGet(`/projects/${projectId}`);
}

export async function mediaStudioGetProjectStatus(projectId: string): Promise<any> {
  return mediaStudioGet(`/projects/${projectId}/status`);
}

export async function mediaStudioRequestWalkthrough(data: {
  propertyAddress: string;
  propertyId?: string;
  requestType: string;
  notes?: string;
  agentId?: string;
}): Promise<any> {
  return mediaStudioPost("/walkthrough-request", data);
}

export async function mediaStudioCancelProject(projectId: string): Promise<any> {
  return mediaStudioPost(`/projects/${projectId}/cancel`, {});
}
