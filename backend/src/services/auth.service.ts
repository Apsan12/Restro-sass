import bcrypt from "bcryptjs";
import { Account, AccountRole } from "../models/Account.js";
import { generateAccessToken } from "../utils/jwt.js";
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
  token: string;
  user: AuthenticatedUser;
}

export class AuthService {
  async login(data: LoginInput): Promise<LoginResponseData> {
    const account = await Account.findOne({ email: data.email }).select(
      "+password"
    );

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

    const token = generateAccessToken(jwtPayload);

    const user: AuthenticatedUser = {
      id: account._id.toString(),
      name: account.name,
      email: account.email,
      role: account.role,
      ...(account.restaurantId ? { restaurantId: account.restaurantId.toString() } : {}),
    };

    return {
      token,
      user,
    };
  }
}

export const authService = new AuthService();
