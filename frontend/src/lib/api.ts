// Vite exposes env variables via import.meta.env and requires the VITE_ prefix.
// Fallback to an empty string so relative paths work during dev (Vite proxy).
const env = import.meta.env as { VITE_API_URL?: string };
const API_BASE = (env.VITE_API_URL || '').replace(/\/$/, '');

type FetchError = {
    status: number;
    body: unknown;
};

async function request(path: string, opts: RequestInit = {}) {
    const url = API_BASE ? `${API_BASE}${path}` : path;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Merge any provided headers (Headers | [string, string][] | Record<string,string>)
    const optsHeaders = opts.headers;
    if (optsHeaders) {
        if (optsHeaders instanceof Headers) {
            optsHeaders.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(optsHeaders)) {
            optsHeaders.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, optsHeaders as Record<string, string>);
        }
    }

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...opts, headers, credentials: 'include' });
    let body: unknown = null;
    try {
        body = await res.json();
    } catch (_e) {
        body = null;
    }
    if (!res.ok) {
        throw { status: res.status, body } as FetchError;
    }
    return body;
}

export const getJson = async <T = unknown>(path: string): Promise<T> =>
    (await request(path, { method: 'GET' })) as T;
export const postJson = async <T = unknown>(path: string, data: unknown): Promise<T> =>
    (await request(path, { method: 'POST', body: JSON.stringify(data) })) as T;
export const putJson = async <T = unknown>(path: string, data: unknown): Promise<T> =>
    (await request(path, { method: 'PUT', body: JSON.stringify(data) })) as T;
export const delJson = async <T = unknown>(path: string): Promise<T> =>
    (await request(path, { method: 'DELETE' })) as T;

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