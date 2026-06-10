export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    public error: ApiError,
  ) {
    super(error.message || 'API Error');
    this.name = 'ApiException';
  }
}

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    console.error('Missing NEXT_PUBLIC_API_BASE_URL environment variable.');
    return 'http://localhost:4000/api/v1'; // Default fallback for local dev
  }
  // Ensure no trailing slash so we can consistently construct paths like `/departments`
  return url.replace(/\/$/, '');
};

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const userId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  if (userId) {
    headers['x-user-id'] = userId;
  }

  return headers;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // Ignore if parsing fails
    }

    const apiError: ApiError = errorData?.error || errorData || {
      code: 'UNKNOWN_ERROR',
      message: `HTTP Error: ${response.status} ${response.statusText}`,
    };

    throw new ApiException(response.status, apiError);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const apiClient = {
  get: async <T>(path: string, options?: RequestInit): Promise<T> => {
    const url = `${getBaseUrl()}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...getHeaders(), ...options?.headers },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(path: string, body?: any, options?: RequestInit): Promise<T> => {
    const url = `${getBaseUrl()}${path}`;
    const response = await fetch(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
      headers: { ...getHeaders(), ...options?.headers },
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(path: string, body?: any, options?: RequestInit): Promise<T> => {
    const url = `${getBaseUrl()}${path}`;
    const response = await fetch(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
      headers: { ...getHeaders(), ...options?.headers },
    });
    return handleResponse<T>(response);
  },

  put: async <T>(path: string, body?: any, options?: RequestInit): Promise<T> => {
    const url = `${getBaseUrl()}${path}`;
    const response = await fetch(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
      headers: { ...getHeaders(), ...options?.headers },
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(path: string, options?: RequestInit): Promise<T> => {
    const url = `${getBaseUrl()}${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      ...options,
      headers: { ...getHeaders(), ...options?.headers },
    });
    return handleResponse<T>(response);
  },
};
