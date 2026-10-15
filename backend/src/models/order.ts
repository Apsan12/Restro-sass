import mongoose, { Document, Schema } from "mongoose";

export enum OrderStatus {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;

  completedBy?: mongoose.Types.ObjectId;
  completedAt?: Date;

  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;

  tableId?: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;

  token: string;
  items: IOrderItem[];

  subtotal: number;
  totalAmount: number;

  status: OrderStatus;

  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new Schema<IOrder>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
    },

    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },

    token: {
      type: String,
      required: true,
      trim: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "An order must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Fast tenant-scoped order queries.
 */
orderSchema.index({ restaurantId: 1, createdAt: -1 });

/*
 * Fast kitchen queries by status.
 */
orderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });

/*
 * Token must be unique inside a restaurant.
 */
orderSchema.index(
  { restaurantId: 1, token: 1 },
  { unique: true }
);

/*
 * Fast staff performance queries.
 */
orderSchema.index({
  restaurantId: 1,
  staffId: 1,
  createdAt: -1,
});

export const Order = mongoose.model<IOrder>("Order", orderSchema);