export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  contactPhone: string;
  whatsapp: string;
  address: string;
  socialInstagram?: string;
  socialFacebook?: string;
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
