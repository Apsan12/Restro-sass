import mongoose from "mongoose";

import {
  Table,
  TableStatus,
} from "../models/Table.js";

import {
  CreateTableInput,
  UpdateTableInput,
} from "../validator/table.validator.js";

export class TableServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "TableServiceError";
    this.statusCode = statusCode;
  }
}

export class TableService {
  // Create a new table for a restaurant
  async createTable(
    restaurantId: string,
    data: CreateTableInput
  ) {
    const existingTable = await Table.findOne({
      restaurantId,
      tableNumber: data.tableNumber,
    });

    if (existingTable) {
      throw new TableServiceError(
        "A table with this number already exists",
        409
      );
    }

    const table = await Table.create({
      restaurantId,
      tableNumber: data.tableNumber,
      name: data.name,
      capacity: data.capacity,
      status: TableStatus.AVAILABLE,
      isActive: true,
    });

    return table;
  }

  // Get all tables belonging to the restaurant
async getAllTables(restaurantId: string) {
  console.log("Restaurant ID used for table query:", restaurantId);

  const tables = await Table.find({
    restaurantId,
  }).sort({
    tableNumber: 1,
  });

  console.log("Tables found:", tables.length);
  console.log("Table restaurant IDs:", tables.map(
    (table) => table.restaurantId.toString()
  ));

  return tables;
}

  // Get a single table belonging to the restaurant
  async getTableById(
    restaurantId: string,
    tableId: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      throw new TableServiceError(
        "Invalid table ID",
        400
      );
    }

    const table = await Table.findOne({
      _id: tableId,
      restaurantId,
    });

    if (!table) {
      throw new TableServiceError(
        "Table not found",
        404
      );
    }

    return table;
  }

  // Update table information
  async updateTable(
    restaurantId: string,
    tableId: string,
    data: UpdateTableInput
  ) {
    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      throw new TableServiceError(
        "Invalid table ID",
        400
      );
    }

    const table = await Table.findOne({
      _id: tableId,
      restaurantId,
    });

    if (!table) {
      throw new TableServiceError(
        "Table not found",
        404
      );
    }

    // Check duplicate table number
    if (data.tableNumber) {
      const existingTable = await Table.findOne({
        _id: { $ne: tableId },
        restaurantId,
        tableNumber: data.tableNumber,
      });

      if (existingTable) {
        throw new TableServiceError(
          "A table with this number already exists",
          409
        );
      }

      table.tableNumber = data.tableNumber;
    }

    if (data.name !== undefined) {
      table.name = data.name;
    }

    if (data.capacity !== undefined) {
      table.capacity = data.capacity;
    }

    if (data.isActive !== undefined) {
      table.isActive = data.isActive;
    }

    await table.save();

    return table;
  }

  // Delete a table
  async deleteTable(
    restaurantId: string,
    tableId: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      throw new TableServiceError(
        "Invalid table ID",
        400
      );
    }

    const table = await Table.findOneAndDelete({
      _id: tableId,
      restaurantId,
    });

    if (!table) {
      throw new TableServiceError(
        "Table not found",
        404
      );
    }

    return table;
  }
}

export const tableService = new TableService();