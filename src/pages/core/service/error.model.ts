export class AppError extends Error {
  constructor(public status: string | number, message?: string) {
    super(message);
  }
}

export interface IError {
  status?: any;
  message: string;
}
