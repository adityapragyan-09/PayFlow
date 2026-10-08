const DEFAULT_API_ORIGIN = "http://localhost:5000";

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (typeof configured === "string" && configured.trim()) {
    return configured.trim().replace(/\/$/, "");
  }
  if (!import.meta.env.DEV) {
    console.warn(
      "VITE_API_BASE_URL is not set. PayFlow is using http://localhost:5000. Set it at build time for production."
    );
  }
  return DEFAULT_API_ORIGIN;
}

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function looksSensitive(message) {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("api_key") ||
    text.includes("api key") ||
    text.includes("gemini") ||
    text.includes("secret") ||
    text.includes("password") ||
    text.includes("token") ||
    text.includes("stack")
  );
}

export function friendlyHttpMessage(status, serverMessage) {
  if (String(serverMessage || "").toLowerCase().includes("ai analysis is unavailable")) {
    return "The AI analysis service is unavailable right now. Please try again later.";
  }

  if (looksSensitive(serverMessage)) {
    if (status >= 500) {
      return "The AI analysis service is unavailable right now. Please try again later.";
    }
    return "The request could not be completed.";
  }

  switch (status) {
    case 0:
      return "Unable to reach PayFlow. Confirm the backend is running and VITE_API_BASE_URL is correct.";
    case 400:
      return serverMessage || "Some of the information sent was invalid.";
    case 401:
      return "You are not authorized. Sign in and try again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return serverMessage || "The requested record could not be found.";
    case 408:
      return "The request timed out. Please try again.";
    case 409:
      return serverMessage || "That record already exists.";
    case 422:
      return serverMessage || "The submitted data failed validation.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      if (status >= 500) {
        return "PayFlow ran into a server error. Please try again shortly.";
      }
      return serverMessage || "Something went wrong. Please try again.";
  }
}

const inflightGets = new Map();

async function requestOnce(path, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 20000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body,
      signal: controller.signal,
    });

    let payload = null;
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }

    if (!response.ok || payload?.success === false) {
      const serverMessage = payload?.error || payload?.message || "";
      if (import.meta.env.DEV && response.status >= 500) {
        console.error("[PayFlow API]", response.status, path, serverMessage || payload);
      }
      throw new ApiError(friendlyHttpMessage(response.status, serverMessage), response.status, null);
    }

    return payload?.data ?? payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error?.name === "AbortError") {
      throw new ApiError(friendlyHttpMessage(408), 408);
    }
    if (import.meta.env.DEV) {
      console.error("[PayFlow API] network failure", path, error);
    }
    throw new ApiError(friendlyHttpMessage(0), 0);
  } finally {
    clearTimeout(timer);
  }
}

export function request(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const key = `${method} ${path}`;
  if (method === "GET" && inflightGets.has(key)) {
    return inflightGets.get(key);
  }

  const promise = requestOnce(path, { ...options, method }).finally(() => {
    if (inflightGets.get(key) === promise) inflightGets.delete(key);
  });

  if (method === "GET") inflightGets.set(key, promise);
  return promise;
}
