import { User } from '../types/index.js';
interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
interface LoginInput {
    email: string;
    password: string;
}
interface TokenPair {
    accessToken: string;
    expiresIn: string;
}
export declare class AuthService {
    register(input: RegisterInput): Promise<{
        user: Omit<User, 'passwordHash'>;
        tokens: TokenPair;
    }>;
    login(input: LoginInput): Promise<{
        user: Omit<User, 'passwordHash'>;
        tokens: TokenPair;
    }>;
    getMe(userId: string): Promise<Omit<User, 'passwordHash'>>;
    updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
    }): Promise<Omit<User, 'passwordHash'>>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    private generateTokens;
    private mapUser;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map