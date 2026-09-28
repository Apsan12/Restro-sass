import mongoose, { Document, Schema } from "mongoose";

export enum AccountRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  BUSINESS_ADMIN = "BUSINESS_ADMIN",
  STAFF = "STAFF",
  KITCHEN_STAFF = "KITCHEN_STAFF",
}
export interface IAccount extends Document {
  restaurantId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: AccountRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: function () {
        return this.role !== AccountRole.SUPER_ADMIN;
      },
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(AccountRole),
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Email lookup
accountSchema.index({ email: 1 });

// Tenant-specific email lookup
accountSchema.index({ restaurantId: 1, email: 1 });

// Only ONE SUPER_ADMIN can exist in the entire system
accountSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: AccountRole.SUPER_ADMIN,
    },
  }
);

export const Account = mongoose.model<IAccount>(
  "Account",
  accountSchema
);