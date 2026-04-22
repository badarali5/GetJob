
const env = import.meta.env as { VITE_API_URL?: string, MODE?: string };
let API_BASE = (env.VITE_API_URL || '').replace(/\/$/, '');

if (!API_BASE && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        API_BASE = 'http://localhost:8081';
    }
}

type FetchError = {
    status: number;
    body: unknown;
};

async function request(path: string, opts: RequestInit = {}) {
    const url = API_BASE ? `${API_BASE}${path}` : path;
    const headers: Record<string, string> = {};

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

    // Set JSON content type only when sending a body to avoid unnecessary preflight requests.
    const hasBody = opts.body !== undefined && opts.body !== null;
    if (hasBody && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const fetchInit: RequestInit = { ...opts, headers, credentials: 'same-origin' };

    let res: Response;
    try {
        res = await fetch(url, fetchInit);
    } catch (primaryError) {
        // In local dev, retry via frontend proxy when direct backend URL fails.
        if (API_BASE && path.startsWith('/')) {
            try {
                res = await fetch(path, fetchInit);
            } catch {
                throw primaryError;
            }
        } else {
            throw primaryError;
        }
    }

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
export function signup(data: { name: string; email: string; password: string; role: string }) {
    return postJson('/api/auth/signup', data);
}
export function signin(data: { email: string; password: string }) {
    return postJson('/api/auth/signin', data);
}

export function setToken(token: string) {
    localStorage.setItem('token', token);
}
export function getToken() {
    return localStorage.getItem('token');
}
export function clearToken() {
    localStorage.removeItem('token');
}

export function getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}
export function applyForJob(userId: number, jobId: string) {
    return postJson(`/jobs/apply?userId=${userId}&jobId=${encodeURIComponent(jobId)}`, {});
}

export function saveJobForLater(userId: number, jobId: string) {
    return postJson(`/jobs/save?userId=${userId}&jobId=${encodeURIComponent(jobId)}`, {});
}