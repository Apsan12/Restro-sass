
import { Request, Response } from "express";
import { authService,AuthServiceError } from "../services/auth.service.js";
import { loginSchema } from "../validator/auth.validator.js";

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await authService.login(validatedData);
    // console.log('Login result:', result);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
   
    });
    // console.log(result.user, result.token);

  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      res.status(
        (error as Error & { statusCode: number }).statusCode
      ).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "xyA login request",
    });
  }
};
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    // const accessToken =
    //   await authService.refreshAccessToken(refreshToken); this is done because the refreshAccessToken method returns an object with both accessToken and refreshToken, so we need to destructure it to get both values.
    const result =
  await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
  success: true,
  message: "Access token refreshed successfully",
  data: {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  },
});
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Refresh token error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    await authService.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Logout error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
