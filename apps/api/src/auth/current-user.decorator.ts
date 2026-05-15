import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface AuthUser {
  id: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  preferredLanguage: string;
}

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthUser => {
  return context.switchToHttp().getRequest().user;
});
