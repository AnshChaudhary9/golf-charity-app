export class ApiService {
  private static readonly baseUrl = (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && import.meta.env.PROD ? window.location.origin : 'http://localhost:3000')) + '/api';
  private static token: string | null = null;

  static setToken(t: string) {
    this.token = t;
  }

  static async request(endpoint: string, method: string = 'GET', body?: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'API Request Failed');
    }

    return res.json();
  }

  static async login(email: string, password: string) {
    const data = await this.request('/auth/login', 'POST', { email, password });
    this.setToken(data.access_token);
    return data;
  }

  static async register(name: string, email: string, password: string, charityId: string) {
    const data = await this.request('/auth/register', 'POST', { name, email, password, charityId });
    this.setToken(data.access_token);
    return data;
  }

  static async getCharities() {
    return this.request('/charities');
  }

  static async getScores() {
    return this.request('/scores/me');
  }

  static async addScore(score: number) {
    return this.request('/scores/add', 'POST', { score });
  }

  // --- Charity Admin ---
  static async createCharity(name: string, description: string) {
    return this.request('/charities', 'POST', { name, description });
  }

  static async deleteCharity(id: string) {
    return this.request(`/charities/delete/${id}`, 'POST');
  }

  static async selectCharity(charityId: string) {
    return this.request(`/charities/select/${charityId}`, 'POST');
  }

  // --- Admin Reporting ---
  static async getAllUsers() {
    return this.request('/admin/users');
  }

  static async getAnalytics() {
    return this.request('/admin/draws/analytics');
  }

  // --- Subscriptions ---
  static async getMySubscription() {
    return this.request('/subscriptions/me');
  }

  static async subscribe(planType: string) {
    return this.request('/subscriptions/subscribe', 'POST', { planType });
  }

  // --- Admin Draws ---
  static async simulateDraw(month: string) {
    return this.request('/admin/draws/simulate', 'POST', { month });
  }

  static async runDraw(month: string) {
    return this.request('/admin/draws/run', 'POST', { month });
  }

  static async verifyWinner(winnerId: string, status: string) {
    return this.request(`/admin/draws/verify/${winnerId}`, 'PUT', { status });
  }

  static async getWinners() {
    return this.request('/admin/draws/winners');
  }

  // --- User Verification ---
  static async uploadProof(winnerId: string, proofImage: string) {
    return this.request(`/admin/draws/winners/${winnerId}/proof`, 'PUT', { proofImage });
  }

  static async getMyWinnings() {
    return this.request('/admin/draws/my-winnings');
  }
}
