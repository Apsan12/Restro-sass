import bcrypt from "bcryptjs";

import { Account, AccountRole } from "../models/Account.js";
import { CreateStaffInput, UpdateStaffInput  } from "../validator/staff.validator.js";

export class StaffServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "StaffServiceError";
    this.statusCode = statusCode;
  }
}

export interface CreatedStaff {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  restaurantId: string;
  isActive: boolean;
}

export class StaffService {
  async createStaff(
    data: CreateStaffInput,
    restaurantId: string
  ): Promise<CreatedStaff> {
    // 1. Make sure the authenticated admin belongs to a restaurant
    if (!restaurantId) {
      throw new StaffServiceError(
        "Restaurant context is required",
        400
      );
    }

    // 2. Check whether email already exists
    const existingAccount = await Account.findOne({
      email: data.email,
    });

    if (existingAccount) {
      throw new StaffServiceError(
        "An account with this email already exists",
        409
      );
    }

    // 3. Hash staff password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // 4. Create staff account
    const staff = await Account.create({
      restaurantId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: AccountRole.STAFF,
      isActive: true,
    });

    // 5. Return safe response
    return {
      id: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      role: staff.role,
      restaurantId: staff.restaurantId!.toString(),
      isActive: staff.isActive,
    };

  }
    async getAllStaff(restaurantId: string): Promise<CreatedStaff[]> {
    if (!restaurantId) {
      throw new StaffServiceError(
        "Restaurant context is required",
        400
      );
    }

    const staff = await Account.find({
      restaurantId,
      role: AccountRole.STAFF,
    }).sort({ createdAt: -1 });

    return staff.map((account) => ({
      id: account._id.toString(),
      name: account.name,
      email: account.email,
      role: account.role,
      restaurantId: account.restaurantId!.toString(),
      isActive: account.isActive,
    }));
  }

  async getStaffById(
  staffId: string,
  restaurantId: string
): Promise<CreatedStaff> {
  if (!restaurantId) {
    throw new StaffServiceError(
      "Restaurant context is required",
      400
    );
  }

  const staff = await Account.findOne({
    _id: staffId,
    restaurantId,
    role: AccountRole.STAFF,
  });

  if (!staff) {
    throw new StaffServiceError(
      "Staff not found",
      404
    );
  }

  return {
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    role: staff.role,
    restaurantId: staff.restaurantId!.toString(),
    isActive: staff.isActive,
  };
}
async updateStaff(
  staffId: string,
  restaurantId: string,
  data: UpdateStaffInput
): Promise<CreatedStaff> {
  if (!restaurantId) {
    throw new StaffServiceError(
      "Restaurant context is required",
      400
    );
  }

  const staff = await Account.findOne({
    _id: staffId,
    restaurantId,
    role: AccountRole.STAFF,
  });

  if (!staff) {
    throw new StaffServiceError(
      "Staff not found",
      404
    );
  }

  if (data.email && data.email !== staff.email) {
    const existingAccount = await Account.findOne({
      email: data.email,
      _id: { $ne: staffId },
    });

    if (existingAccount) {
      throw new StaffServiceError(
        "An account with this email already exists",
        409
      );
    }
  }

  if (data.name !== undefined) {
    staff.name = data.name;
  }

  if (data.email !== undefined) {
    staff.email = data.email;
  }

  await staff.save();

  return {
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    role: staff.role,
    restaurantId: staff.restaurantId!.toString(),
    isActive: staff.isActive,
  };
}
async deleteStaff(
  staffId: string,
  restaurantId: string
): Promise<void> {
  if (!restaurantId) {
    throw new StaffServiceError(
      "Restaurant context is required",
      400
    );
  }

  const staff = await Account.findOne({
    _id: staffId,
    restaurantId,
    role: AccountRole.STAFF,
  });

  if (!staff) {
    throw new StaffServiceError(
      "Staff not found",
      404
    );
  }

  await staff.deleteOne();
}

}

export const staffService = new StaffService(); 