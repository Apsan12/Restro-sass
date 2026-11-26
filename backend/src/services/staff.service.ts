import bcrypt from "bcryptjs";

import { Account, AccountRole } from "../models/Account.js";
import {
  CreateStaffInput,
  UpdateStaffInput,
} from "../validator/staff.validator.js";

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

const MANAGED_STAFF_ROLES = [
  AccountRole.STAFF,
  AccountRole.KITCHEN_STAFF,
];

export class StaffService {
  async createStaff(
    data: CreateStaffInput,
    restaurantId: string
  ): Promise<CreatedStaff> {
    // 1. Make sure restaurant context exists
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
      role: data.role,
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

  async getAllStaff(
    restaurantId: string
  ): Promise<CreatedStaff[]> {
    if (!restaurantId) {
      throw new StaffServiceError(
        "Restaurant context is required",
        400
      );
    }

    const staff = await Account.find({
      restaurantId,
      role: {
        $in: MANAGED_STAFF_ROLES,
      },
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
      role: {
        $in: MANAGED_STAFF_ROLES,// the staff roles that can be managed by the restaurant admin or manager
      },
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
      role: {
        $in: MANAGED_STAFF_ROLES,
      },
    });

    if (!staff) {
      throw new StaffServiceError(
        "Staff not found",
        404
      );
    }

    // Check duplicate email
    if (
      data.email &&
      data.email !== staff.email
    ) {
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

    // Update name
    if (data.name !== undefined) {
      staff.name = data.name;
    }

    // Update email
    if (data.email !== undefined) {
      staff.email = data.email;
    }

    // Update role
    if (data.role !== undefined) {
      staff.role = data.role;
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
      role: {
        $in: MANAGED_STAFF_ROLES,
      },
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