export class PublicApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly retryable = false,
  ) {
    super(message);
  }
}

export function isPublicApiError(error: unknown): error is PublicApiError {
  return error instanceof PublicApiError;
}
