import bcrypt from "bcryptjs";
import { Account, AccountRole } from "../models/Account.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/jwt.js";
import { randomUUID } from "crypto";
import { redisSessionService } from "./redisSession.service.js";
import { LoginInput } from "../validator/auth.validator.js";

export class AuthServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthServiceError";
    this.statusCode = statusCode;
  }
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  restaurantId?: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export class AuthService {
  async login(data: LoginInput): Promise<LoginResponseData> {
    const account = await Account.findOne({
      email: data.email.trim().toLowerCase(),
    }).select("+password");

    if (!account) {
      throw new AuthServiceError("Invalid email or password", 401);
    }

    if (!account.isActive) {
      throw new AuthServiceError("Account is inactive", 403);
    }

    const isPasswordValid = await bcrypt.compare(data.password, account.password);

    if (!isPasswordValid) {
      throw new AuthServiceError("Invalid email or password", 401);
    }

    const jwtPayload = {
      userId: account._id.toString(),
      role: account.role,
      ...(account.role !== AccountRole.SUPER_ADMIN && account.restaurantId
        ? { restaurantId: account.restaurantId.toString() }
        : {}),
    };

  const accessToken = generateAccessToken(jwtPayload);

const sessionId = randomUUID();

const refreshToken = generateRefreshToken({
  ...jwtPayload,
  jti: sessionId,
});

await redisSessionService.createSession(
  sessionId,
  {
    userId: jwtPayload.userId,
    role: jwtPayload.role,
    ...(jwtPayload.restaurantId
      ? { restaurantId: jwtPayload.restaurantId }
      : {}),
  },
  7 * 24 * 60 * 60 // 7 days in seconds samji hai bhai 
);

    const user: AuthenticatedUser = {
      id: account._id.toString(),
      name: account.name,
      email: account.email,
      role: account.role,
      ...(account.restaurantId ? { restaurantId: account.restaurantId.toString() } : {}),
    };

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
async refreshAccessToken(
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthServiceError(
      "Invalid or expired refresh token",
      401
    );
  }

  const session = await redisSessionService.getSession(payload.jti);

  if (!session) {
    throw new AuthServiceError(
      "Refresh session is invalid or expired",
      401
    );
  }

  // Delete the old refresh session
  await redisSessionService.deleteSession(payload.jti);

  // Create a new session ID
  const newSessionId = randomUUID();

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: session.userId,
    role: session.role as AccountRole,
    ...(session.restaurantId
      ? { restaurantId: session.restaurantId }
      : {}),
  });

  // Generate new refresh token
  const newRefreshToken = generateRefreshToken({
    userId: session.userId,
    role: session.role as AccountRole,
    ...(session.restaurantId
      ? { restaurantId: session.restaurantId }
      : {}),
    jti: newSessionId,
  });

  // Store the new refresh session
  await redisSessionService.createSession(
    newSessionId,
    {
      userId: session.userId,
      role: session.role,
      ...(session.restaurantId
        ? { restaurantId: session.restaurantId }
        : {}),
    },
    7 * 24 * 60 * 60
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}
async logout(refreshToken: string): Promise<void> {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthServiceError("Invalid or expired refresh token", 401);
  }

  await redisSessionService.deleteSession(payload.jti);
}
}

export const authService = new AuthService();
