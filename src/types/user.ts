import { UserRole } from "@/types/auth";

export interface Student {
  _id: string;
  boxIds: string[];
  name: string;
  email: string;
  contactPhone?: string;
  whatsapp?: string;
  address?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  role: UserRole;
  createdAt: string;
}
