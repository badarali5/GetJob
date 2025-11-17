const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

type FetchError = {
    status: number;
    body: any;
};

async function request(path: string, opts: RequestInit = {}) {
    // If API_BASE is set, use it. Otherwise assume relative path (dev proxy).
    const url = API_BASE ? `${API_BASE}${path}` : path;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(opts.headers as Record<string, string> || {}),
    };

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...opts, headers, credentials: 'include' });
    let body: any = null;
    try {
        body = await res.json();
    } catch (e) {
        body = null;
    }
    if (!res.ok) {
        const err: FetchError = { status: res.status, body };
        throw err;
    }
    return body;
}

export const getJson = (path: string) => request(path, { method: 'GET' });
export const postJson = (path: string, data: any) =>
    request(path, { method: 'POST', body: JSON.stringify(data) });
export const putJson = (path: string, data: any) =>
    request(path, { method: 'PUT', body: JSON.stringify(data) });
export const delJson = (path: string) =>
    request(path, { method: 'DELETE' });

// Auth helpers
export function signup(data: { name: string; email: string; password: string; role: string }) {
    return postJson('/api/auth/signup', data);
}
export function signin(data: { email: string; password: string }) {
    return postJson('/api/auth/signin', data);
}

// Token helpers
export function setToken(token: string) {
    localStorage.setItem('token', token);
}
export function getToken() {
    return localStorage.getItem('token');
}
export function clearToken() {
    localStorage.removeItem('token');
}