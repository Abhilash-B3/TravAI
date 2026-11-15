import { ENV } from '../config/env';

/**
 * Standard Application API Error class
 */
export class ApiError extends Error {
  constructor(message, status, code, details = {}, correlationId = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code || 'UNKNOWN_ERROR';
    this.details = details;
    this.correlationId = correlationId;
  }
}

/**
 * Generates a unique UUID v4 for correlation and idempotency
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Centralized HTTP Client for Nexgile-TravAI
 */
export async function apiClient(endpoint, options = {}) {
  const {
    method = 'GET',
    data = null,
    params = null,
    headers = {},
    token = null,
    organizationId = null,
    propertyId = null,
    idempotencyKey = null,
    timeoutMs = ENV.TIMEOUT_MS,
    signal = null,
  } = options;

  // Build query parameters
  let url = endpoint;
  if (!endpoint.startsWith('http')) {
    if (endpoint.startsWith(ENV.API_BASE_URL)) {
      url = endpoint;
    } else if (endpoint.startsWith('/api/v1')) {
      url = endpoint;
    } else {
      url = `${ENV.API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }
  }
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    });
    url = `${url}?${query.toString()}`;
  }

  // Construct headers
  const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('nexgile_access_token') : null);
  const correlationId = headers['X-Correlation-ID'] || generateUUID();
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Correlation-ID': correlationId,
    ...headers,
  };

  if (activeToken) {
    requestHeaders['Authorization'] = `Bearer ${activeToken}`;
  }

  if (organizationId) {
    requestHeaders['X-Organization-ID'] = organizationId;
  }

  if (propertyId) {
    requestHeaders['X-Property-ID'] = propertyId;
  }

  if (idempotencyKey) {
    requestHeaders['Idempotency-Key'] = idempotencyKey;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Link caller's signal if provided
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorPayload = responseData?.error || {};
      throw new ApiError(
        errorPayload.message || response.statusText || 'An unexpected error occurred',
        response.status,
        errorPayload.code || `HTTP_${response.status}`,
        errorPayload.details || {},
        response.headers.get('X-Correlation-ID') || correlationId
      );
    }

    return responseData;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out or was aborted', 408, 'REQUEST_TIMEOUT');
    }

    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(
      err.message || 'Network communication failure',
      0,
      'NETWORK_ERROR',
      {},
      correlationId
    );
  }
}
