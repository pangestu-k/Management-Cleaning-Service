import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { authApi } from "../api/auth";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (
        name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => Promise<void>;
    registerAdmin: (
        name: string,
        email: string,
        password: string,
        password_confirmation: string,
        admin_secret_key: string
    ) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await authApi.me();
            setUser(response.data.user);
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        const { token: newToken, user: newUser } = response.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => {
        const response = await authApi.register({
            name,
            email,
            password,
            password_confirmation,
        });
        const { token: newToken, user: newUser } = response.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const registerAdmin = async (
        name: string,
        email: string,
        password: string,
        password_confirmation: string,
        admin_secret_key: string
    ) => {
        const response = await authApi.registerAdmin({
            name,
            email,
            password,
            password_confirmation,
            admin_secret_key,
        });
        const { token: newToken, user: newUser } = response.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                registerAdmin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
