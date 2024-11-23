import { Response, Request } from "express";
import * as admin from "firebase-admin";

export const ResgisterUser = async (req: Request, res: Response) => {
  const { email, password, type } = req.body;
  if (!email || !password || !type) {
    return res
      .status(400)
      .json({ message: "Todos los campos son requeridos." });
  }
  try {
    const db = admin.database();
    const ref = db.ref("users");

    const snapshot = await ref.orderByChild("email").equalTo(email).once("value");
    if (snapshot.exists()) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado." });
    }

    const newUserRef = ref.push();

    await newUserRef.set({
      email,
      password,
      type,
      orders: [],
      verify: false,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });

    // const usermailOptions: SendMailOptions = {
    //   from: EMAIL,
    //   to: email,
    //   subject: `Hola ${name} contactaste a JCMaker`,
    //   html: htmlContentUser({ name }),
    // };

    return res.status(201).json({
      message: "Usuario registrado correctamente.",
      userId: newUserRef.key,
    });
  } catch (error: any) {
    console.error("Error al registrar usuario:", error);

    // Manejo de errores comunes
    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
