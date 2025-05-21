/**
 * Base custom error for deSEC API interactions.
 */
export class DeSECError extends Error {
  statusCode: number;
  responseBody?: any;

  constructor(message: string, statusCode: number, responseBody?: any) {
    super(message);
    this.name = "DeSECError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    Object.setPrototypeOf(this, DeSECError.prototype);
  }
}

/**
 * Error specifically for rate limiting (HTTP 429).
 */
export class DeSECRateLimitError extends DeSECError {
  retryAfter: number; // In seconds

  constructor(message: string, retryAfter: number, responseBody?: any) {
    super(message, 429, responseBody);
    this.name = "DeSECRateLimitError";
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, DeSECRateLimitError.prototype);
  }
}
