const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1';

type ApiRequestOptions<TBody = unknown> = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	body?: TBody;
	token?: string | null;
	signal?: AbortSignal;
	params?: Record<string, string | number | undefined | null>;
};

const buildUrl = (path: string, params?: ApiRequestOptions['params']): string => {
	const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (value === undefined || value === null || value === '') return;
			url.searchParams.set(key, String(value));
		});
	}
	return url.toString();
};

export async function apiRequest<TResponse, TBody = unknown>(path: string, options: ApiRequestOptions<TBody> = {}): Promise<TResponse> {
	const url = buildUrl(path, options.params);
	const headers = new Headers(options.method && options.method !== 'GET' ? { 'Content-Type': 'application/json' } : undefined);

	if (options.token) {
		headers.set('Authorization', `Bearer ${options.token}`);
	}

	const response = await fetch(url, {
		method: options.method ?? 'GET',
		body: options.body && options.method && options.method !== 'GET' ? JSON.stringify(options.body) : undefined,
		headers,
		signal: options.signal,
	});

	if (!response.ok) {
		const errorPayload = await response.json().catch(() => ({}));
		const message = (errorPayload as { error?: string }).error ?? 'Не удалось выполнить запрос';
		throw new Error(message);
	}

	return response.json() as Promise<TResponse>;
}

