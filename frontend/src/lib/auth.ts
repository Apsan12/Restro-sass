import type { AuthUser } from "@/types/auth";

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

const AUTH_STORAGE_KEY = "restaurant_auth";

export const saveAuthSession = (
  session: AuthSession
): void => {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session)
  );
};

export const getAuthSession = (): AuthSession | null => {
  const storedSession =
    localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const updateAuthTokens = (
  accessToken: string,
  refreshToken: string
): void => {
  const session = getAuthSession();

  if (!session) {
    return;
  }

  saveAuthSession({
    ...session,
    accessToken,
    refreshToken,
  });
};

export const clearAuthSession = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};