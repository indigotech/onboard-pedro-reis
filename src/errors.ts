export class CustomError extends Error {
  code: number;
  additionalInfo?: string;
  name: string;

  constructor(message: string, code: number, additionalInfo?: string) {
    super(message);
    this.code = code;
    this.additionalInfo = additionalInfo;
    this.name = 'CustomError';
  }
}

export function formatError(error: any) {
  const originalError = error.originalError;

  if(originalError && originalError.name == 'CustomError') {
    return {
      ... error,
      message: originalError.message,
      code: originalError.code,
      additionalInfo: originalError.additionalInfo,
    };
  } else {
    return {
      ...error,
    }
  }
}
