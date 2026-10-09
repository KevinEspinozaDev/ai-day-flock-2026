export class DomainError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS');
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Sesión inválida o expirada') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}
