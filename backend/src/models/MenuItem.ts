import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;

  name: string;
  description?: string;
  price: number;

  image?: {
    url: string;
    publicId: string;
  };

  isAvailable: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      url: {
        type: String,
        trim: true,
      },
      publicId: {
        type: String,
        trim: true,
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Fast lookup of menu items inside a restaurant
menuItemSchema.index({
  restaurantId: 1,
});

// Get menu items by category
menuItemSchema.index({
  restaurantId: 1,
  categoryId: 1,
});

// Prevent duplicate menu item names inside the same category
menuItemSchema.index(
  {
    restaurantId: 1,
    categoryId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

export const MenuItem = mongoose.model<IMenuItem>(
  "MenuItem",
  menuItemSchema
);