export interface AuthUser {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    preferredLanguage: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
