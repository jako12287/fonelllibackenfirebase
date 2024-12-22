import { Request, Response } from "express";
import admin from "firebase-admin";

export const getNotificationsHistory = async (req: Request, res: Response) => {
  try {
    const db = admin.database();
    const notificationsHistoryRef = db.ref("notificationsHistory");

    // Obtener todas las notificaciones de la tabla notificationsHistory
    const snapshot = await notificationsHistoryRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "No se encontraron notificaciones en el historial.",
      });
    }

    // Transformar los datos de la snapshot en un arreglo de notificaciones
    const notifications: any[] = [];
    snapshot.forEach((childSnapshot) => {
      const notification = childSnapshot.val();
      notifications.push({
        id: childSnapshot.key,
        ...notification,
      });
    });

    // Devolver las notificaciones en la respuesta
    return res.status(200).json({
      message: "Historial de notificaciones obtenido exitosamente.",
      notifications,
    });
  } catch (error) {
    console.error("Error al obtener el historial de notificaciones:", error);
    return res.status(500).json({
      message:
        "Error interno del servidor al obtener el historial de notificaciones.",
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  const { notificationId } = req.params;

  // Verificar que se haya proporcionado el ID de la notificación
  if (!notificationId) {
    return res.status(400).json({
      message: "El ID de la notificación es obligatorio.",
    });
  }

  try {
    const db = admin.database();
    const notificationRef = db
      .ref("notificationsHistory")
      .child(notificationId);

    // Verificar si la notificación existe en la base de datos
    const snapshot = await notificationRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        message: "Notificación no encontrada.",
      });
    }

    // Eliminar la notificación
    await notificationRef.remove();

    // Devolver respuesta exitosa
    return res.status(200).json({
      message: "Notificación eliminada exitosamente.",
    });
  } catch (error) {
    console.error("Error al eliminar la notificación:", error);
    return res.status(500).json({
      message: "Error interno del servidor al eliminar la notificación.",
    });
  }
};
