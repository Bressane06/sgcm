/**
 * Base exception class for application-specific errors
 */
export class AppException extends Error {
  constructor(
    public readonly type: string,
    public readonly title: string,
    public readonly status: number,
    public readonly detail?: string,
    public readonly instance?: string,
  ){
    super(detail || title);
    this.name = 'AppException';
  }
}
