import axios from 'axios';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown> | string[] | string;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    public error: ApiError,
    public raw?: unknown,
  ) {
    super(formatApiErrorMessage(status, error, raw));
    this.name = 'ApiException';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stringifyDetails = (details: unknown): string[] => {
  if (!details) return [];
  if (Array.isArray(details)) return details.map((item) => String(item));
  if (typeof details === 'string') return [details];
  if (isRecord(details)) {
    return Object.entries(details).map(([key, value]) => {
      const rendered = Array.isArray(value) ? value.join(', ') : String(value);
      return `${key}: ${rendered}`;
    });
  }
  return [String(details)];
};

const normalizeDetails = (details: unknown): ApiError['details'] => {
  if (typeof details === 'string') return details;
  if (Array.isArray(details)) return details.map(String);
  if (isRecord(details)) return details;
  return undefined;
};

const formatApiErrorMessage = (status: number, error: ApiError, raw?: unknown) => {
  const parts: string[] = [`HTTP ${status}`];

  if (error.code && error.code !== 'UNKNOWN_ERROR') {
    parts.push(error.code);
  }

  if (error.message) {
    parts.push(error.message);
  }

  const rawMessage = isRecord(raw) ? raw.message : undefined;
  const rawDetails = Array.isArray(rawMessage) ? rawMessage : undefined;
  const explicitDetails = stringifyDetails(error.details);
  const details = explicitDetails.length > 0 ? explicitDetails : stringifyDetails(rawDetails);

  if (details.length > 0) {
    parts.push(`Detalhes: ${details.join('; ')}`);
  }

  return parts.join(' - ');
};

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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const userId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  if (userId) {
    headers['x-user-id'] = userId;
  }

  return headers;
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
  const headers = getHeaders();
  Object.keys(headers).forEach(key => {
    config.headers.set(key, headers[key]);
  });
  return config;
});

function normalizeApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    if (response) {
      const errorData = response.data;
      
      const errorRecord = isRecord(errorData) ? errorData : {};
      const nestedError = isRecord(errorRecord.error) ? errorRecord.error : null;
      const rawMessage = errorRecord.message;
      const message = Array.isArray(rawMessage)
        ? typeof errorRecord.error === 'string'
          ? errorRecord.error
          : `Erro HTTP: ${response.status} ${response.statusText}`
        : typeof rawMessage === 'string'
          ? rawMessage
          : typeof nestedError?.message === 'string'
            ? nestedError.message
            : `Erro HTTP: ${response.status} ${response.statusText}`;

      const code = typeof nestedError?.code === 'string'
        ? nestedError.code
        : typeof errorRecord.error === 'string'
          ? errorRecord.error
          : 'UNKNOWN_ERROR';

      const details = normalizeDetails(nestedError?.details ?? errorRecord.details ?? (Array.isArray(rawMessage) ? rawMessage : undefined));

      const apiError: ApiError = {
        ...(nestedError || {}),
        code,
        message,
        details,
      };

      throw new ApiException(response.status, apiError, errorData);
    }
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Erro inesperado ao comunicar com a API');
}

export const apiClient = {
  get: async <T>(path: string, options?: any): Promise<T> => {
    try {
      const response = await axiosInstance.get<T>(path, options);
      return response.data;
    } catch (error) {
      normalizeApiError(error);
    }
  },

  post: async <T>(path: string, body?: any, options?: any): Promise<T> => {
    try {
      const response = await axiosInstance.post<T>(path, body, options);
      return response.data;
    } catch (error) {
      normalizeApiError(error);
    }
  },

  patch: async <T>(path: string, body?: any, options?: any): Promise<T> => {
    try {
      const response = await axiosInstance.patch<T>(path, body, options);
      return response.data;
    } catch (error) {
      normalizeApiError(error);
    }
  },

  put: async <T>(path: string, body?: any, options?: any): Promise<T> => {
    try {
      const response = await axiosInstance.put<T>(path, body, options);
      return response.data;
    } catch (error) {
      normalizeApiError(error);
    }
  },

  delete: async <T>(path: string, options?: any): Promise<T> => {
    try {
      const response = await axiosInstance.delete<T>(path, options);
      return response.data;
    } catch (error) {
      normalizeApiError(error);
    }
  },
};
