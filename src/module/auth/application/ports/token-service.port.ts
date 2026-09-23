export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  sub: string;
  phone: string;
  universe: string;
  isSuperAdmin: boolean;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // en secondes
}

export interface ITokenService {
  generateTokens(payload: TokenPayload): Promise<GeneratedTokens>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}
