export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface TokenPayload {
  sub: string;
  username: string;
}

export interface IssuedToken {
  accessToken: string;
  expiresIn: number;
}

export interface TokenService {
  sign(payload: TokenPayload): IssuedToken;
  verify(token: string): TokenPayload;
}
