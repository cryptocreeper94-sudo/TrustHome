import * as crypto from "crypto";

const BASE_URL = process.env.TRUSTLAYER_BASE_URL || "https://dwsc.io";

function sign(apiSecret: string, body: string, timestamp: string): string {
  return crypto
    .createHmac("sha256", apiSecret)
    .update(`${body}${timestamp}`)
    .digest("hex");
}

function getCredentials(): { apiKey: string; apiSecret: string } {
  return {
    apiKey: process.env.TRUSTLAYER_API_KEY || "",
    apiSecret: process.env.TRUSTLAYER_API_SECRET || "",
  };
}

function isConfigured(): boolean {
  const { apiKey, apiSecret } = getCredentials();
  return !!(apiKey && apiSecret);
}

async function trustLayerRequest(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  body?: Record<string, any>
): Promise<any> {
  if (!isConfigured()) {
    return {
      error: "Trust Layer API credentials not configured",
      notAvailable: true,
    };
  }

  try {
    const { apiKey, apiSecret } = getCredentials();
    const timestamp = Date.now().toString();
    const bodyStr = body ? JSON.stringify(body) : "{}";
    const signature = sign(apiSecret, bodyStr, timestamp);

    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-App-Key": apiKey,
      "X-App-Signature": signature,
      "X-App-Timestamp": timestamp,
    };

    const options: RequestInit = { method, headers };
    if (method !== "GET") {
      options.body = bodyStr;
    }

    const response = await fetch(url, options);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(
        `trustLayerRequest [${endpoint}]: non-JSON response (${contentType}), status ${response.status}`
      );
      return {
        error: `Non-JSON response from Trust Layer (${response.status})`,
        notAvailable: true,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      console.warn(
        `trustLayerRequest [${endpoint}]: API error ${response.status}:`,
        data
      );
      return {
        error: data.error || `Trust Layer API error (${response.status})`,
        status: response.status,
        details: data,
      };
    }

    return data;
  } catch (error) {
    console.error(`trustLayerRequest error [${endpoint}]:`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function tlSyncUser(
  email: string,
  password: string,
  displayName?: string,
  username?: string
): Promise<any> {
  return trustLayerRequest("POST", "/api/ecosystem/sync-user", {
    email,
    password,
    displayName,
    username,
  });
}

export async function tlSyncPassword(
  email: string,
  newPassword: string
): Promise<any> {
  return trustLayerRequest("POST", "/api/ecosystem/sync-password", {
    email,
    newPassword,
  });
}

export async function tlVerifyCredentials(
  email: string,
  password: string
): Promise<any> {
  return trustLayerRequest("POST", "/api/ecosystem/verify-credentials", {
    email,
    password,
  });
}

export async function tlGetCertificationTiers(): Promise<any> {
  return trustLayerRequest("GET", "/api/guardian/tiers");
}

export async function tlSubmitCertification(data: {
  projectName: string;
  projectUrl?: string;
  contactEmail: string;
  tier: "self_cert" | "assurance_lite" | "guardian_premier";
  stripePaymentId?: string;
}): Promise<any> {
  return trustLayerRequest("POST", "/api/guardian/certifications", data);
}

export async function tlGetCertificationStatus(certId: string): Promise<any> {
  return trustLayerRequest("GET", `/api/guardian/certifications/${certId}`);
}

export async function tlGetPublicRegistry(): Promise<any> {
  return trustLayerRequest("GET", "/api/guardian/registry");
}

export async function tlGetBlockchainStamps(referenceId: string): Promise<any> {
  return trustLayerRequest(
    "GET",
    `/api/guardian/stamps?referenceId=${referenceId}`
  );
}

export async function tlCheckoutCertification(data: {
  tier: string;
  projectName: string;
  projectUrl?: string;
  contactEmail: string;
  contractCount?: number;
}): Promise<any> {
  return trustLayerRequest("POST", "/api/guardian/checkout", {
    ...data,
    contractCount: data.contractCount || 1,
  });
}

export function tlIsConfigured(): boolean {
  return isConfigured();
}
