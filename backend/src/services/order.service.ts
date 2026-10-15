import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

import { Order, OrderStatus } from "../models/order.js";
import type { IOrder, IOrderItem } from "../models/order.js";
import { MenuItem } from "../models/MenuItem.js";
import { Table, TableStatus } from "../models/Table.js";
import type { ITable } from "../models/Table.js";
import { Room, RoomStatus } from "../models/Room.js";
import type { IRoom } from "../models/Room.js";
import { CreateOrderInput } from "../validator/order.validator.js";
import { getPaginationMeta, getPaginationParams } from "../utils/pagination.js";
import { AccountRole } from "../models/Account.js";


export class OrderServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "OrderServiceError";
    this.statusCode = statusCode;
  }
}

export class OrderService {
  async createOrder(
    restaurantId: string,
    staffId: string,
    data: CreateOrderInput
  ): Promise<HydratedDocument<IOrder>> {
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new OrderServiceError("Invalid restaurant ID", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      throw new OrderServiceError("Invalid staff ID", 400);
    }

    const restaurantObjectId =
      new mongoose.Types.ObjectId(restaurantId);

    const staffObjectId =
      new mongoose.Types.ObjectId(staffId);

    let table: HydratedDocument<ITable> | null = null;
    let room: HydratedDocument<IRoom> | null = null;

    if (data.tableId) {
      if (!mongoose.Types.ObjectId.isValid(data.tableId)) {
        throw new OrderServiceError("Invalid table ID", 400);
      }

      table = await Table.findOne({
        _id: data.tableId,
        restaurantId: restaurantObjectId,
      });

      if (!table) {
        throw new OrderServiceError("Table not found", 404);
      }

      if (!table.isActive) {
        throw new OrderServiceError(
          "This table is inactive",
          400
        );
      }

      if (table.status === TableStatus.MAINTENANCE) {
        throw new OrderServiceError(
          "This table is currently under maintenance",
          400
        );
      }

      if (table.status === TableStatus.OCCUPIED) {
        throw new OrderServiceError(
          "This table is already occupied",
          409
        );
      }

      if (table.status === TableStatus.RESERVED) {
        throw new OrderServiceError(
          "This table is currently reserved",
          409
        );
      }
    }

    if (data.roomId) {
      if (!mongoose.Types.ObjectId.isValid(data.roomId)) {
        throw new OrderServiceError("Invalid room ID", 400);
      }

      room = await Room.findOne({
        _id: data.roomId,
        restaurantId: restaurantObjectId,
      });

      if (!room) {
        throw new OrderServiceError("Room not found", 404);
      }

      if (!room.isActive) {
        throw new OrderServiceError(
          "This room is inactive",
          400
        );
      }

      if (room.status === RoomStatus.MAINTENANCE) {
        throw new OrderServiceError(
          "This room is currently under maintenance",
          400
        );
      }

      if (room.status === RoomStatus.OCCUPIED) {
        throw new OrderServiceError(
          "This room is already occupied",
          409
        );
      }

      if (room.status === RoomStatus.RESERVED) {
        throw new OrderServiceError(
          "This room is currently reserved",
          409
        );
      }
    }

    const menuItemIds: string[] = Array.from(
      new Set(
        data.items.map(
          (item: CreateOrderInput["items"][number]) => item.menuItemId
        )
      )
    );

    const invalidMenuItemIds = menuItemIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidMenuItemIds.length > 0) {
      throw new OrderServiceError(
        "One or more menu item IDs are invalid",
        400
      );
    }

    const menuItems = await MenuItem.find({
      _id: {
        $in: menuItemIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
      restaurantId: restaurantObjectId,
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new OrderServiceError(
        "One or more menu items were not found",
        404
      );
    }

    const menuItemMap = new Map(
      menuItems.map((menuItem) => [
        menuItem._id.toString(),
        menuItem,
      ])
    );

    const orderItems: IOrderItem[] = data.items.map(
      (item: CreateOrderInput["items"][number]) => {
        const menuItem = menuItemMap.get(item.menuItemId);

        if (!menuItem) {
          throw new OrderServiceError(
            `Menu item ${item.menuItemId} was not found`,
            404
          );
        }

        if (!menuItem.isAvailable) {
          throw new OrderServiceError(
            `${menuItem.name} is currently unavailable`,
            400
          );
        }

        const totalPrice = menuItem.price * item.quantity;

        return {
          menuItemId: menuItem._id,
          name: menuItem.name,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          totalPrice,
        };
      }
    );

    const subtotal = orderItems.reduce<number>(
      (sum, item) => sum + item.totalPrice,
      0
    );

    const totalAmount = subtotal;

    const token = await this.generateOrderToken(restaurantId);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      if (table) {
        const currentTable =
          await Table.findOne({
            _id: table._id,
            restaurantId: restaurantObjectId,
            status: TableStatus.AVAILABLE,
            isActive: true,
          }).session(session);

        if (!currentTable) {
          throw new OrderServiceError(
            "This table is no longer available",
            409
          );
        }
      }

      if (room) {
        const currentRoom =
          await Room.findOne({
            _id: room._id,
            restaurantId: restaurantObjectId,
            status: RoomStatus.AVAILABLE,
            isActive: true,
          }).session(session);

        if (!currentRoom) {
          throw new OrderServiceError(
            "This room is no longer available",
            409
          );
        }
      }

      const [order] = await Order.create(
        [
          {
            restaurantId: restaurantObjectId,
            staffId: staffObjectId,

            tableId: table?._id,
            roomId: room?._id,

            token,

            items: orderItems,

            subtotal,
            totalAmount,

            status: OrderStatus.PENDING,
          },
        ],
        {
          session,
        }
      );

      if (table) {
        const tableUpdate =
          await Table.updateOne(
            {
              _id: table._id,
              restaurantId: restaurantObjectId,
              status: TableStatus.AVAILABLE,
            },
            {
              $set: {
                status: TableStatus.OCCUPIED,
              },
            },
            {
              session,
            }
          );

        if (tableUpdate.modifiedCount !== 1) {
          throw new OrderServiceError(
            "Failed to occupy the table",
            409
          );
        }
      }

      if (room) {
        const roomUpdate =
          await Room.updateOne(
            {
              _id: room._id,
              restaurantId: restaurantObjectId,
              status: RoomStatus.AVAILABLE,
            },
            {
              $set: {
                status: RoomStatus.OCCUPIED,
              },
            },
            {
              session,
            }
          );

        if (roomUpdate.modifiedCount !== 1) {
          throw new OrderServiceError(
            "Failed to occupy the room",
            409
          );
        }
      }

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof OrderServiceError) {
        throw error;
      }

      throw new OrderServiceError(
        "Failed to create order",
        500
      );
    } finally {
      await session.endSession();
    }
  }

  private async generateOrderToken(
    restaurantId: string
  ): Promise<string> {
    const latestOrder =
      await Order.findOne({
        restaurantId,
      }).sort({
        createdAt: -1,
      });

    let nextNumber = 1;

    if (latestOrder) {
      const match =
        latestOrder.token.match(/^ORD-(\d+)$/);

      if (match) {
        nextNumber =
          Number(match[1]) + 1;
      }
    }

    return `ORD-${String(nextNumber).padStart(3, "0")}`;
  }
  async getAllOrders(
  restaurantId: string,
  page?: string | number,
  limit?: string | number,
  status?: OrderStatus
) {
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new OrderServiceError("Invalid restaurant ID", 400);
  }

  const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

  const {
    page: currentPage,
    limit: currentLimit,
    skip,
  } = getPaginationParams(page, limit);

  const filter: {
    restaurantId: mongoose.Types.ObjectId;
    status?: OrderStatus;
  } = {
    restaurantId: restaurantObjectId,
  };

  if (status) {
    filter.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit),

    Order.countDocuments(filter),
  ]);

  const pagination = getPaginationMeta(
    currentPage,
    currentLimit,
    total
  );

  return {
    orders,
    pagination,
  };
}
  async getOrderById(
    restaurantId: string,
    orderId: string
  ): Promise<HydratedDocument<IOrder>> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new OrderServiceError("Invalid order ID", 400);
    }

    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
    });

    if (!order) {
      throw new OrderServiceError("Order not found", 404);
    }

    return order;
  }

  async cancelOrder(
  restaurantId: string,
  orderId: string,
  userId: string
): Promise<HydratedDocument<IOrder>> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new OrderServiceError("Invalid order ID", 400);
    }

    const restaurantObjectId =
      new mongoose.Types.ObjectId(restaurantId);
    const orderObjectId =
      new mongoose.Types.ObjectId(orderId);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const order = await Order.findOne({
        _id: orderObjectId,
        restaurantId: restaurantObjectId,
      }).session(session);

      if (!order) {
        throw new OrderServiceError("Order not found", 404);
      }

      if (
        order.status !== OrderStatus.PENDING &&
        order.status !== OrderStatus.PREPARING
      ) {
        throw new OrderServiceError(
          `Order cannot be cancelled while it is ${order.status}`,
          400
        );
      }

      order.status = OrderStatus.CANCELLED;

      await order.save({ session });

      if (order.tableId) {
        const tableUpdate = await Table.updateOne(
          {
            _id: order.tableId,
            restaurantId: restaurantObjectId,
            status: TableStatus.OCCUPIED,
          },
          {
            $set: {
              status: TableStatus.AVAILABLE,
            },
          },
          {
            session,
          }
        );

        if (tableUpdate.modifiedCount !== 1) {
          throw new OrderServiceError(
            "Failed to release the table",
            409
          );
        }
      }

      if (order.roomId) {
        const roomUpdate = await Room.updateOne(
          {
            _id: order.roomId,
            restaurantId: restaurantObjectId,
            status: RoomStatus.OCCUPIED,
          },
          {
            $set: {
              status: RoomStatus.AVAILABLE,
            },
          },
          {
            session,
          }
        );

        if (roomUpdate.modifiedCount !== 1) {
          throw new OrderServiceError(
            "Failed to release the room",
            409
          );
        }
      }

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof OrderServiceError) {
        throw error;
      }

      throw new OrderServiceError(
        "Failed to cancel order",
        500
      );
    } finally {
      await session.endSession();
    }
  }

async updateOrderStatus(
  restaurantId: string,
  orderId: string,
  newStatus: OrderStatus,
  userRole: AccountRole,
  userId: string
): Promise<HydratedDocument<IOrder>> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new OrderServiceError("Invalid order ID", 400);
    }

    const restaurantObjectId =
      new mongoose.Types.ObjectId(restaurantId);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const order = await Order.findOne({
        _id: new mongoose.Types.ObjectId(orderId),
        restaurantId: restaurantObjectId,
      }).session(session);

      if (!order) {
        throw new OrderServiceError("Order not found", 404);
      }

      /*
       * Define the allowed order status transitions.
       */
      const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [
          OrderStatus.PREPARING,
          OrderStatus.CANCELLED,
        ],

        [OrderStatus.PREPARING]: [
          OrderStatus.READY,
          OrderStatus.CANCELLED,
        ],

        [OrderStatus.READY]: [
          OrderStatus.COMPLETED,
        ],

        [OrderStatus.COMPLETED]: [],

        [OrderStatus.CANCELLED]: [],
      };

      const allowedNextStatuses =
        allowedTransitions[order.status];

      if (!allowedNextStatuses.includes(newStatus)) {
        throw new OrderServiceError(
          `Cannot change order status from ${order.status} to ${newStatus}`,
          400
        );
      }

      /*
       * Update the order status.
       */
  order.status = newStatus;

if (newStatus === OrderStatus.COMPLETED) {
  order.completedBy = new mongoose.Types.ObjectId(userId);
  order.completedAt = new Date();
}

await order.save({ session });

      /*
       * When the order is completed or cancelled,
       * release the associated table.
       */
      if (
        newStatus === OrderStatus.COMPLETED ||
        newStatus === OrderStatus.CANCELLED
      ) {
        if (order.tableId) {
          const tableUpdate = await Table.updateOne(
            {
              _id: order.tableId,
              restaurantId: restaurantObjectId,
              status: TableStatus.OCCUPIED,
            },
            {
              $set: {
                status: TableStatus.AVAILABLE,
              },
            },
            {
              session,
            }
          );

          if (tableUpdate.modifiedCount !== 1) {
            throw new OrderServiceError(
              "Failed to release the table",
              409
            );
          }
        }

        /*
         * Release the room if the order belongs to a room.
         */
        if (order.roomId) {
          const roomUpdate = await Room.updateOne(
            {
              _id: order.roomId,
              restaurantId: restaurantObjectId,
              status: RoomStatus.OCCUPIED,
            },
            {
              $set: {
                status: RoomStatus.AVAILABLE,
              },
            },
            {
              session,
            }
          );

          if (roomUpdate.modifiedCount !== 1) {
            throw new OrderServiceError(
              "Failed to release the room",
              409
            );
          }
        }
      }

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof OrderServiceError) {
        throw error;
      }

      throw new OrderServiceError(
        "Failed to update order status",
        500
      );
    } finally {
      await session.endSession();
    }
  }
}


export const orderService =
  new OrderService();