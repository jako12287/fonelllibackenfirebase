import { Request, Response } from "express";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs"; // Importar bcrypt

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fonelli";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    const db = admin.database();
    const ref = db.ref("users");

    const snapshot = await ref
      .orderByChild("email")
      .equalTo(email)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Revisa las credenciales." });
    }

    const user = snapshot.val();
    const userId = Object.keys(user)[0]
    const userData: any = Object.values(user)[0];

    let isValidPassword = false;

    // Verificar la contraseña según el valor de "verify"
    console.log("campo verify", userData.verify)
    console.log("userData", {...userData, userId})
    console.log("password", password)
    if (userData.verify) {
      // Si está encriptada, usar bcrypt
      isValidPassword = await bcrypt.compare(password.toString(), userData.password.toString());
    } else {
      // Si no está encriptada, comparar directamente
      isValidPassword = userData.password.toString() === password.toString();
    }

    if (!isValidPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // Generar el token si la contraseña es válida
    const token = jwt.sign(
      { email: userData.email, userId, type: userData.type },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login exitoso.",
      token,
      user: {_id:userId, email: userData.email, type: userData.type, verify: userData.verify},
    });
  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
