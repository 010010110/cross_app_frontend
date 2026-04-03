export interface LoginDto {
  email: string;
  password: string;
}

export type UserRole = "ADMIN" | "COACH" | "ALUNO";

export interface JwtUser {
  sub: string;
  email: string;
  boxIds: string[];
  role: UserRole;
}

export interface SessionResponse {
  accessToken: string;
  tokenType: string;
  user: JwtUser;
}
