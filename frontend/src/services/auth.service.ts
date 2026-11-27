import api from "@/lib/api";
import type {
  LoginInput,
  LoginResponse,
} from "@/types/auth";

export const login = async (
  data: LoginInput
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
};