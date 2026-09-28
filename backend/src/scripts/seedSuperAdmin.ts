import bcrypt from "bcryptjs";
import { Account, AccountRole } from "../models/Account.js";

export const seedSuperAdmin = async (): Promise<void> => {
  try {
    const existingSuperAdmin = await Account.findOne({
      role: AccountRole.SUPER_ADMIN,
    });

    // Super admin already exists
    if (existingSuperAdmin) {
      console.log("SUPER_ADMIN already exists.");
      return;
    }

    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

    if (!email || !password) {
      throw new Error(
        "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be defined in .env"
      );
    }

    if (password.length < 6) {
      throw new Error(
        "SUPER_ADMIN_PASSWORD must be at least 6 characters long"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Account.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: AccountRole.SUPER_ADMIN,
      isActive: true,
    });

    console.log("SUPER_ADMIN created successfully.");
  } catch (error) {
    console.error("Failed to seed SUPER_ADMIN:", error);
    throw error;
  }
};