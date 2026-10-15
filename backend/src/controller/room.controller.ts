import { Request, Response } from "express";

import {
  createRoomSchema,
  updateRoomSchema,
} from "../validator/room.validator.js";

import {
  roomService,
  RoomServiceError,
} from "../services/room.service.js";

export const createRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const validatedData = createRoomSchema.parse(req.body);

    const room = await roomService.createRoom(
      restaurantId,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    if (error instanceof RoomServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Invalid room data",
    });
  }
};

export const getAllRooms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const rooms = await roomService.getAllRooms(restaurantId);

    res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
};

export const getRoomById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const roomId = req.params.roomId as string;

    const room = await roomService.getRoomById(
      restaurantId,
      roomId
    );

    res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      data: room,
    });
  } catch (error) {
    if (error instanceof RoomServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch room",
    });
  }
};

export const updateRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const roomId = req.params.roomId as string;

    const validatedData = updateRoomSchema.parse(req.body);

    const room = await roomService.updateRoom(
      restaurantId,
      roomId,
      validatedData
    );

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    if (error instanceof RoomServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Invalid room data",
    });
  }
};

export const deleteRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const roomId = req.params.roomId as string;

    await roomService.deleteRoom(
      restaurantId,
      roomId
    );

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    if (error instanceof RoomServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete room",
    });
  }
};