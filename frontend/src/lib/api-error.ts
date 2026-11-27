import axios from "axios";

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export const getApiErrorMessage = (
  error: unknown
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const response = error.response;

    if (!response) {
      return "Unable to connect to the server";
    }

    if (response.data?.message) {
      return response.data.message;
    }

    switch (response.status) {
      case 400:
        return "Invalid request";

      case 401:
        return "Authentication failed";

      case 403:
        return "You don't have permission to perform this action";

      case 404:
        return "Requested resource was not found";

      case 409:
        return "This request conflicts with existing data";

      case 422:
        return "Please check the submitted information";

      case 500:
        return "Server error. Please try again later";

      default:
        return "Something went wrong";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};