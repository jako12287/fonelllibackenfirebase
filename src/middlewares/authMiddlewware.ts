import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";

const JWT_SECRET = process.env.JWT_SECRET || "fonelli";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado." });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const { userId, type } = decoded;

    const db = admin.database();
    const userRef = db.ref(`users/${userId}`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }

    const user = snapshot.val();

    // Verificar que la sesión esté activa y que el token coincida
    if (
      (type === "ADMIN" || type === "COLLABORATOR") &&
      (user.sessionActive === false || user.sessionToken !== token)
    ) {
      return res.status(401).json({
        message: "Sesión inválida o expirada. Inicie sesión nuevamente.",
        code: "SESSION_INVALID",
      });
    }

    // Agregar los datos decodificados al request
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};
