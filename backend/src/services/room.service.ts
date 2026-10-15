import mongoose from "mongoose";

import {
  Room,
  RoomStatus,
} from "../models/Room.js";

import {
  CreateRoomInput,
  UpdateRoomInput,
} from "../validator/room.validator.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../utils/pagination.js";
export class RoomServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "RoomServiceError";
    this.statusCode = statusCode;
  }
}

export class RoomService {
  // Create a new room for a restaurant
  async createRoom(
    restaurantId: string,
    data: CreateRoomInput
  ) {
    const existingRoom = await Room.findOne({
      restaurantId,
      roomNumber: data.roomNumber,
    });

    if (existingRoom) {
      throw new RoomServiceError(
        "A room with this number already exists",
        409
      );
    }

    const room = await Room.create({
      restaurantId,
      roomNumber: data.roomNumber,
      name: data.name,
      capacity: data.capacity,
      description: data.description,
      amenities: data.amenities ?? [],
      bookingFee: data.bookingFee ?? 0,
      minimumOrderAmount: data.minimumOrderAmount,
      status: RoomStatus.AVAILABLE,
      isActive: true,
    });

    return room;
  }

  // Get all rooms belonging to the restaurant
async getAllRooms(
  restaurantId: string,
  page?: string | number,
  limit?: string | number
) {
  const {
    page: currentPage,
    limit: currentLimit,
    skip,
  } = getPaginationParams(page, limit);

  const filter = { restaurantId };

  const [rooms, total] = await Promise.all([
    Room.find(filter)
      .sort({ roomNumber: 1 })
      .skip(skip)
      .limit(currentLimit),

    Room.countDocuments(filter),
  ]);

  const pagination = getPaginationMeta(
    currentPage,
    currentLimit,
    total
  );

  return {
    rooms,
    pagination,
  };
}
  // Get a single room belonging to the restaurant
  async getRoomById(
    restaurantId: string,
    roomId: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new RoomServiceError(
        "Invalid room ID",
        400
      );
    }

    const room = await Room.findOne({
      _id: roomId,
      restaurantId,
    });

    if (!room) {
      throw new RoomServiceError(
        "Room not found",
        404
      );
    }

    return room;
  }

  // Update room information
  async updateRoom(
    restaurantId: string,
    roomId: string,
    data: UpdateRoomInput
  ) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new RoomServiceError(
        "Invalid room ID",
        400
      );
    }

    const room = await Room.findOne({
      _id: roomId,
      restaurantId,
    });

    if (!room) {
      throw new RoomServiceError(
        "Room not found",
        404
      );
    }

    // Check duplicate room number
    if (data.roomNumber) {
      const existingRoom = await Room.findOne({
        _id: { $ne: roomId },
        restaurantId,
        roomNumber: data.roomNumber,
      });

      if (existingRoom) {
        throw new RoomServiceError(
          "A room with this number already exists",
          409
        );
      }

      room.roomNumber = data.roomNumber;
    }

    if (data.name !== undefined) {
      room.name = data.name;
    }

    if (data.capacity !== undefined) {
      room.capacity = data.capacity;
    }

    if (data.description !== undefined) {
      room.description = data.description;
    }

    if (data.amenities !== undefined) {
      room.amenities = data.amenities;
    }

    if (data.bookingFee !== undefined) {
      room.bookingFee = data.bookingFee;
    }

    if (data.minimumOrderAmount !== undefined) {
      room.minimumOrderAmount = data.minimumOrderAmount;
    }

    if (data.isActive !== undefined) {
      room.isActive = data.isActive;
    }

    await room.save();

    return room;
  }

  // Delete a room
  async deleteRoom(
    restaurantId: string,
    roomId: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new RoomServiceError(
        "Invalid room ID",
        400
      );
    }

    const room = await Room.findOneAndDelete({
      _id: roomId,
      restaurantId,
    });

    if (!room) {
      throw new RoomServiceError(
        "Room not found",
        404
      );
    }

    return room;
  }
}

export const roomService = new RoomService();