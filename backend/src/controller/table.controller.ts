import { Request, Response } from "express";

import {
  createTableSchema,
  updateTableSchema,
} from "../validator/table.validator.js";

import {
  tableService,
  TableServiceError,
} from "../services/table.service.js";

export const createTable = async (
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

    const validatedData = createTableSchema.parse(req.body);

    const table = await tableService.createTable(
      restaurantId,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: table,
    });
  } catch (error) {
    if (error instanceof TableServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Invalid table data",
    });
  }
};

export const getAllTables = async (
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

    const tables = await tableService.getAllTables(restaurantId);

    res.status(200).json({
      success: true,
      message: "Tables fetched successfully",
      data: tables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tables",
    });
  }
};

export const getTableById = async (
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

    const tableId = req.params.tableId as string;

    const table = await tableService.getTableById(
      restaurantId,
      tableId
    );

    res.status(200).json({
      success: true,
      message: "Table fetched successfully",
      data: table,
    });
  } catch (error) {
    if (error instanceof TableServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch table",
    });
  }
};

export const updateTable = async (
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

    const tableId = req.params.tableId as string;

    const validatedData = updateTableSchema.parse(req.body);

    const table = await tableService.updateTable(
      restaurantId,
      tableId,
      validatedData
    );

    res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: table,
    });
  } catch (error) {
    if (error instanceof TableServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Invalid table data",
    });
  }
};

export const deleteTable = async (
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

    const tableId = req.params.tableId as string;

    await tableService.deleteTable(
      restaurantId,
      tableId
    );

    res.status(200).json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    if (error instanceof TableServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete table",
    });
  }
};