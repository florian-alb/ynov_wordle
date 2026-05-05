export class InvalidApiError extends Error {
  constructor(error: Error) {
    super(`Word api responded with error: ${error.message}`);
    this.name = "InvalidApiError";
  }
}
