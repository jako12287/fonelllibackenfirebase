import { Request, Response } from "express";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

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

    let snapshot;

    // Verificar si el campo "email" es un correo electrónico o un número
    const isEmail = /\S+@\S+\.\S+/.test(email); // Patrón para verificar si es un email

    if (isEmail) {
      snapshot = await ref.orderByChild("email").equalTo(email).once("value");
    } else {
      snapshot = await ref
        .orderByChild("customerNumber")
        .equalTo(email) // Aquí email actúa como customerNumber
        .once("value");
    }

    if (!snapshot || !snapshot.exists()) {
      return res.status(404).json({ message: "Revisa las credenciales." });
    }

    const user = snapshot.val();
    const userId = Object.keys(user)[0];
    const userData: any = Object.values(user)[0];

    let isValidPassword = false;

    // Verificar la contraseña según el valor de "verify"
    if (userData.verify) {
      isValidPassword = await bcrypt.compare(
        password.toString(),
        userData.password.toString()
      );
    } else {
      isValidPassword = userData.password.toString() === password.toString();
    }

    if (!isValidPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // Verificar si el usuario es ADMIN o COLLABORATOR
    if (userData.type === "ADMIN" || userData.type === "COLLABORATOR") {
      await ref.child(userId).update({ sessionActive: true });
    }

    // Generar el token si la contraseña es válida
    const token = jwt.sign(
      { email: userData.email, userId, type: userData.type },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Guardar el token en la base de datos para invalidar anteriores
    await ref
      .child(userId)
      .update({ sessionActive: true, sessionToken: token });

    return res.status(200).json({
      message: "Login exitoso.",
      token,
      user: {
        _id: userId,
        email: userData.email,
        type: userData.type,
        verify: userData.verify,
        changePass: userData.changePass,
        customerNumber: userData.customerNumber,
        sessionActive: userData?.sessionActive || null,
      },
    });
  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Faltan campos requeridos." });
  }

  try {
    const db = admin.database();
    const ref = db.ref("users");

    await ref.child(userId).update({
      sessionActive: false,
      sessionToken: null,
    });

    return res.status(200).json({ message: "Sesión cerrada correctamente." });
  } catch (error) {
    console.error("Error en el logout:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
