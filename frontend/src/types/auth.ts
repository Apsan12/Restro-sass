import type { AccountRole } from "@/types/roles";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  restaurantId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {// this is checking who is logged in and what is the role of the user and also checking the access token and refresh token
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}