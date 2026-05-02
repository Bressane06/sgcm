export class AppException extends Error {
  constructor(
    public readonly type: string,
    public readonly title: string,
    public readonly status: number,
    public readonly detail?: string,
    public readonly instance?: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(detail || title);
    Object.setPrototypeOf(this, AppException.prototype);
  }
}
