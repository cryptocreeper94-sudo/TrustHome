export const APP_NAME = "trusthome";
export const TENANT_ID = "trusthome";

function getBaseUrl(): string {
  // Use the local Coolify deployment URL of Axiom42 Suite if possible, or the public one.
  return process.env.AXIOM42_SUITE_URL || "https://axiom42suite.com/api/v1";
}

function getApiKey(): string {
  // Use the API key seeded in Axiom42Suite specifically for TrustHome
  return process.env.AXIOM42_API_KEY || "th_prod_placeholder_key";
}

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getApiKey()}`,
    "X-Tenant-Id": TENANT_ID,
  };
}

export function mediaStudioIsConfigured(): boolean {
  return true; // We now use a static placeholder if the env var isn't set
}

export async function mediaStudioGet(endpoint: string, params?: Record<string, string>): Promise<any> {
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
      console.warn(`mediaStudioGet [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from Axiom42 (${response.status})`, notAvailable: true };
    }
    return await response.json();
  } catch (error) {
    console.error(`mediaStudioGet error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function mediaStudioPost(endpoint: string, body: Record<string, any>): Promise<any> {
  try {
    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`mediaStudioPost [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`);
      return { error: `Non-JSON response from Axiom42 (${response.status})`, notAvailable: true };
    }
    return await response.json();
  } catch (error) {
    console.error(`mediaStudioPost error [${endpoint}]:`, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function mediaStudioStatus(): Promise<any> {
  return mediaStudioGet("/health"); // Or a specific status endpoint if it exists
}

export async function mediaStudioListProjects(): Promise<any> {
  return mediaStudioGet("/projects"); // Adjust to the actual Axiom42 Suite routes if different
}

export async function mediaStudioGetProject(projectId: string): Promise<any> {
  return mediaStudioGet(`/projects/${projectId}`);
}

export async function mediaStudioGetProjectStatus(projectId: string): Promise<any> {
  return mediaStudioGet(`/projects/${projectId}/status`);
}

export async function mediaStudioRequestWalkthrough(data: {
  title: string;
  clips: string[]; // Base64 or URLs
  addMusic: boolean;
  addVoiceover: boolean;
  voiceoverScript?: string;
  addCaptions: boolean;
  customAudioTrimStart?: number;
  customAudioTrimEnd?: number;
}): Promise<any> {
  // This sends the request to Axiom42 Suite's processing endpoint
  return mediaStudioPost("/walkthrough/process", data);
}

export async function mediaStudioCancelProject(projectId: string): Promise<any> {
  return mediaStudioPost(`/projects/${projectId}/cancel`, {});
}
