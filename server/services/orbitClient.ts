interface WorkerData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: string;
  payRate?: number;
  workState?: string;
  certifications?: string[];
}

interface TimesheetData {
  id: string;
  workerId: string;
  date: string;
  hoursWorked: number;
  overtimeHours?: number;
  jobId?: string;
  status: string;
}

interface ContractorData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ein?: string;
  businessName?: string;
  payRate: number;
  workState: string;
}

interface FinancialTransaction {
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  timestamp: string;
}

interface CertificationData {
  workerId: string;
  name: string;
  issuedDate: string;
  expirationDate?: string;
}

interface EcosystemRegistration {
  appId: string;
  appName: string;
  appUrl: string;
  webhookUrl?: string;
  capabilities?: string[];
  ownershipSplit?: { partner1: string; partner1Pct: number; partner2: string; partner2Pct: number };
}

interface EcosystemSSOLogin {
  identifier: string;
  credential: string;
  sourceApp: string;
}

interface EcosystemSSORegister {
  email: string;
  firstName: string;
  lastName: string;
  sourceApp: string;
  trustLayerId?: string;
}

export class OrbitEcosystemClient {
  private hubUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private appName: string;

  constructor(appName: string) {
    this.hubUrl = process.env.ORBIT_HUB_URL || "https://orbitstaffing.io";
    this.apiKey = process.env.ORBIT_ECOSYSTEM_API_KEY || "";
    this.apiSecret = process.env.ORBIT_ECOSYSTEM_API_SECRET || "";
    this.appName = appName;
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
      "X-API-Secret": this.apiSecret,
      "X-App-Name": this.appName,
    };
  }

  private async request(method: string, path: string, body?: any) {
    const url = `${this.hubUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(`ORBIT API ${method} ${path} failed: ${JSON.stringify(err)}`);
    }
    return res.json();
  }

  async checkConnection() {
    return this.request("GET", "/api/ecosystem/status");
  }

  async syncWorkers(workers: WorkerData[]) {
    return this.request("POST", "/api/ecosystem/sync/workers", { workers });
  }

  async syncContractors(contractors: ContractorData[]) {
    return this.request("POST", "/api/ecosystem/sync/contractors", { contractors });
  }

  async syncTimesheets(timesheets: TimesheetData[]) {
    return this.request("POST", "/api/ecosystem/sync/timesheets", { timesheets });
  }

  async syncCertifications(certs: CertificationData[]) {
    return this.request("POST", "/api/ecosystem/sync/certifications", { certifications: certs });
  }

  async syncW2(w2Data: any[]) {
    return this.request("POST", "/api/ecosystem/sync/w2", { w2Data });
  }

  async sync1099(data1099: any[]) {
    return this.request("POST", "/api/ecosystem/sync/1099", { contractors: data1099 });
  }

  async getShopWorkers(shopId: string) {
    return this.request("GET", `/api/ecosystem/shops/${shopId}/workers`);
  }

  async getShopPayroll(shopId: string) {
    return this.request("GET", `/api/ecosystem/shops/${shopId}/payroll`);
  }

  async reportTransaction(tx: FinancialTransaction) {
    return this.request("POST", "/api/ecosystem/sync/financial-transaction", tx);
  }

  async getFinancialStatement(params?: { period?: string; format?: string }) {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return this.request("GET", `/api/ecosystem/financial-statement${query}`);
  }

  async getSnippets() {
    return this.request("GET", "/api/ecosystem/snippets");
  }

  async pushSnippet(snippet: { title: string; language: string; code: string; description?: string }) {
    return this.request("POST", "/api/ecosystem/snippets", snippet);
  }

  async getLogs() {
    return this.request("GET", "/api/ecosystem/logs");
  }

  async pushLog(log: { action: string; details?: any }) {
    return this.request("POST", "/api/ecosystem/logs", log);
  }

  async registerApp(registration: EcosystemRegistration) {
    return this.request("POST", "/api/admin/ecosystem/register-app", registration);
  }

  async ecosystemSSOLogin(login: EcosystemSSOLogin) {
    return this.request("POST", "/api/auth/ecosystem-login", login);
  }

  async ecosystemSSORegister(registration: EcosystemSSORegister) {
    return this.request("POST", "/api/chat/auth/register", registration);
  }

  get isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  get baseUrl(): string {
    return this.hubUrl;
  }
}

export const orbitTrustHome = new OrbitEcosystemClient("TrustHome");
