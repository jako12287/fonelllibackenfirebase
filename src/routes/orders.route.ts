import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrder,
  updateOrderStatus,
  updateOrderStatusAdmin,
  addFolioToOrder,
  saveNotificationToken,
  testMessage,
} from "../controller/orders.controller";

const router = Router();

router.post("/create_order", createOrder);
router.delete("/orders/:orderId", deleteOrder);
router.put("/orders/:orderId", updateOrder);
router.put("/orders/status/:orderId", updateOrderStatus);
router.put("/orders/status-admin/:orderId", updateOrderStatusAdmin);
router.put("/orders/add-folio/:orderId", addFolioToOrder);
router.get("/get_orders", getAllOrders);
router.get("/orders/user/:userId", getOrdersByUserId);
router.get("/orders/:orderId", getOrderById);
router.post("/api/save-token", saveNotificationToken);
router.post("/testmessages", testMessage);

export default router;
