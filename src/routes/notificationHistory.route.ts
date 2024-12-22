import { Router } from "express";
import {
  deleteNotification,
  getNotificationsHistory,
} from "../controller/notifications.controller";

const router = Router();

router.get("/notifications", getNotificationsHistory);

router.delete("/notification/:notificationId", deleteNotification);

export default router;
