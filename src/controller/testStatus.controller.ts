import { Request, Response } from "express";
import admin from "firebase-admin";

export const testStatus = async (req: Request, res: Response) => {
  try {
    const db = admin.database();
    const ref = db.ref(".info/connected");

    const snapshot = await ref.once("value");

    if (snapshot.val()) {
      return res.status(200).json({ message: "Firebase conectado correctamente." });
    } else {
      return res.status(500).json({
        message: "No se pudo establecer conexión con la base de datos.",
      });
    }
  } catch (error) {
    console.error("Error al conectar con Firebase:", error);
    return res.status(500).json({
      message: "Error interno del servidor, no se pudo conectar a Firebase.",
    });
  }
};
