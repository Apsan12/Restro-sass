import mongoose, { Document, Schema } from "mongoose";

export enum RoomStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  RESERVED = "RESERVED",
  MAINTENANCE = "MAINTENANCE",
}

export interface IRoom extends Document {
  restaurantId: mongoose.Types.ObjectId;

  roomNumber: string;
  name?: string;

  capacity: number;

  description?: string;

  amenities: string[];

  bookingFee: number;
  minimumOrderAmount?: number;

  status: RoomStatus;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    // Restaurant that owns this room
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    // Human-readable room identifier
    // Example: R-01, R-02, VIP-01
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // Display name
    // Example: VIP Dining Room
    name: {
      type: String,
      trim: true,
    },

    // Maximum number of people
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Optional room description
    description: {
      type: String,
      trim: true,
    },

    // Features available in the room
    // Example: ["AC", "TV", "Sound System"]
    amenities: {
      type: [String],
      default: [],
    },

    // Fee charged for booking the room
    bookingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Minimum amount that must be spent in the room
    minimumOrderAmount: {
      type: Number,
      min: 0,
    },

    // Current room availability state
    status: {
      type: String,
      enum: Object.values(RoomStatus),
      default: RoomStatus.AVAILABLE,
    },

    // Allows the restaurant to disable the room
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// A restaurant cannot have two rooms
// with the same room number.
roomSchema.index(
  {
    restaurantId: 1,
    roomNumber: 1,
  },
  {
    unique: true,
  }
);

// Useful when finding rooms by availability.
roomSchema.index({
  restaurantId: 1,
  status: 1,
});

export const Room = mongoose.model<IRoom>(
  "Room",
  roomSchema
);