import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import {
  getAuthSession,
  updateAuthTokens,
  clearAuthSession,
} from "@/lib/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (
  error: unknown,
  token: string | null
): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const session = getAuthSession();

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

    
     if (
  error.response?.status !== 401 ||
  originalRequest?._retry ||
  originalRequest?.url?.includes("/auth/login") ||
  originalRequest?.url?.includes("/auth/refresh")
) {
  return Promise.reject(error);
}

    const session = getAuthSession();

    if (!session?.refreshToken) {
      clearAuthSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then((newAccessToken) => {
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await refreshApi.post(
        "/auth/refresh",
        {
          refreshToken: session.refreshToken,
        }
      );

      const {
        accessToken,
        refreshToken,
      } = response.data.data;

      updateAuthTokens(
        accessToken,
        refreshToken
      );

      processQueue(null, accessToken);

      originalRequest.headers.Authorization =
        `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      clearAuthSession();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
// in short way this code is creating an axios instance with interceptors to handle authentication, including automatically refreshing access tokens when they expire and managing a queue of failed requests during the refresh process.

export default api;