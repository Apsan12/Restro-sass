
import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { loginSchema } from "../validator/auth.validator.js";

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await authService.login(validatedData);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.token,
      },
    });
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
      message: "Invalid login request",
    });
  }
};

export const logout = (
  _req: Request,
  res: Response
): void => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
