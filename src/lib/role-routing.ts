import { UserRole } from "@/types/auth";

export function getRoleHomeRoute(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "COACH":
      return "/coach";
    case "ALUNO":
      return "/";
    default:
      return "/";
  }
}
