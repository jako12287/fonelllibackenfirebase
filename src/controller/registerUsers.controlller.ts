import { Response, Request } from "express";
import { htmlContentUpdateUser, htmlContentUser } from "../util/mssageEmail";
import { userType } from "../types/models/userModel";
import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import bcrypt from "bcrypt";
import * as admin from "firebase-admin";
import * as XLSX from "xlsx";
import * as dotenv from "dotenv";
dotenv.config();

const EMAIL = process.env.EMAIL;
const PASSWORDEMAIL = process.env.PASSWORDEMAIL;
const allowedUserTypes = [userType.COLLABORATOR, userType.CUSTOMER];

console.log("EMAIL is Passed to", EMAIL);
const transporter: Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORDEMAIL,
  },
});

//create new user

export const resgisterUser = async (req: Request, res: Response) => {
  const { email, password, type, customerNumber } = req.body;
  if (!email || !password || !type) {
    return res
      .status(400)
      .json({ message: "Todos los campos son requeridos." });
  }

  const dataEmail: any = {
    email,
    password,
  };

  if (type === userType.CUSTOMER && customerNumber) {
    dataEmail.customerNumber = customerNumber;
  }

  const usermailOptions: SendMailOptions = {
    from: EMAIL,
    to: email,
    subject: "Bienvenido a Fonelli",
    html: htmlContentUser(dataEmail),
  };

  try {
    const db = admin.database();
    const ref = db.ref("users");

    const snapshot = await ref
      .orderByChild("email")
      .equalTo(email)
      .once("value");
    if (snapshot.exists()) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    const newUserRef = ref.push();

    const dataNewUser: any = {
      email,
      password,
      type,
      orders: [],
      verify: false,
      changePass: 0,
      createdAt: admin.database.ServerValue.TIMESTAMP,
    };
    if (type === userType.CUSTOMER) {
      dataNewUser.customerNumber = customerNumber;
    }
    try {
      await newUserRef.set(dataNewUser);
      console.log("Usuario creado en Firebase.");
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }

    try {
      await transporter.sendMail(usermailOptions);
      console.log("Correo enviado correctamente.");
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }

    console.log("Respuesta que se devolverá:", {
      message: "Usuario registrado correctamente ok.",
      userId: newUserRef.key,
      sendEmail: "creado",
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente ok.",
      userId: newUserRef.key,
      sendEmail: "creado",
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

//change password whit bycrypt

export const changepassword = async (req: Request, res: Response) => {
  const { _id, newPassword } = req.body;

  if (!_id || !newPassword) {
    return res
      .status(400)
      .json({ message: "Todos los campos son requeridos." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "La contraseña debe tener al menos 6 caracteres.",
    });
  }

  try {
    const db = admin.database();
    const userRef = db.ref(`users/${_id}`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const saltRounds = parseInt(process.env.SALTROUNDS || "10");
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await userRef.update({
      password: hashedPassword,
      verify: true,
      changePass: 1,
    });

    return res
      .status(200)
      .json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

//get All Users

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const db = admin.database();
    const ref = db.ref("users");

    const snapshot = await ref.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No se encontraron usuarios." });
    }

    const users: any[] = [];

    snapshot.forEach((childSnapshot) => {
      const user = childSnapshot.val();
      users.push({
        id: childSnapshot.key,
        ...user,
        orders: user.orders || [],
      });
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

//Get User By Id

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { _id } = req.params; // Obtén el _id desde el body de la solicitud

    if (!_id) {
      return res.status(400).json({ message: "El _id es requerido." });
    }

    const db = admin.database();
    const ref = db.ref("users").child(_id); // Obtén la referencia del usuario con ese _id

    const snapshot = await ref.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const user = snapshot.val();

    return res.status(200).json({
      id: snapshot.key,
      ...user,
      orders: user.orders || [],
    });
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

//Chage data user

export const changeDataUser = async (req: Request, res: Response) => {
  const { _id, email, password, type, customerNumber } = req.body;

  if (!_id || (!email && !password && !type)) {
    return res.status(400).json({
      message:
        "Se requiere al menos uno de los campos a actualizar (Email, Contraseña o Tipo de cuenta).",
    });
  }

  try {
    const db = admin.database();
    const userRef = db.ref(`users/${_id}`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const updates: Record<string, any> = {};
    if (email) updates.email = email;
    if (password) {
      updates.password = password;
      updates.verify = false;
    }
    if (type) updates.type = type;
    if (customerNumber && type === userType.CUSTOMER) {
      updates.customerNumber = customerNumber;
    }

    await userRef.update(updates);

    const userEmail = email || snapshot.val().email;

    const dataEmail: any = {
      email,
      password: !password ? "La contraseña no se modificó" : password,
    };

    if (type === userType.CUSTOMER && customerNumber) {
      dataEmail.customerNumber = customerNumber;
    }

    const userMailOptions: SendMailOptions = {
      from: EMAIL,
      to: userEmail,
      subject: "Actualización de datos de tu cuenta",
      html: htmlContentUpdateUser(dataEmail),
    };

    try {
      await transporter.sendMail(userMailOptions);
      console.log("Correo enviado correctamente al usuario.");
    } catch (error) {
      console.error("Error al enviar correo:", error);
    }

    return res.status(200).json({
      message: "Datos del usuario actualizados correctamente.",
    });
  } catch (error) {
    console.error("Error al actualizar datos del usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

//Delete user

export const deleteUser = async (req: Request, res: Response) => {
  const { _id } = req.body;
  if (!_id) {
    return res
      .status(400)
      .json({ message: "El _id del usuario es requerido." });
  }
  try {
    const db = admin.database();
    const userRef = db.ref(`users/${_id}`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    await userRef.remove();
    return res.status(200).json({
      message: "Usuario eliminado correctamente de la base de datos.",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

//register masseve

export const registerMassiveUsers = async (req: Request, res: Response) => {
  const file = req.file;
  try {
    if (!file) {
      return res.status(400).json({ message: "Se requiere un archivo Excel." });
    }
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "El archivo Excel está vacío." });
    }
    const db = admin.database();
    const ref = db.ref("users");

    const errors: any[] = [];
    const success: any[] = [];

    for (const row of data) {
      const { email, password, type } = row as {
        email: string;
        password: string;
        type: string;
      };

      if (!email || !password || !type) {
        errors.push({ row, message: "Campos faltantes." });
        continue;
      }

      if (!allowedUserTypes.includes(type as userType)) {
        errors.push({
          email,
          message: `El tipo de usuario ${type} no es válido.`,
        });
        continue;
      }

      const snapshot = await ref
        .orderByChild("email")
        .equalTo(email)
        .once("value");

      if (snapshot.exists()) {
        errors.push({ email, message: "Correo ya registrado." });
        continue;
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

      const userMailOptions: SendMailOptions = {
        from: EMAIL,
        to: email,
        subject: "Bienvenido a Fonelli",
        html: htmlContentUser({ email, password }),
      };

      try {
        await transporter.sendMail(userMailOptions);
        console.log(`Correo enviado correctamente a ${email}`);
      } catch (error) {
        console.error(`Error al enviar correo a ${email}:`, error);
        errors.push({
          email,
          message: "Usuario creado, pero falló el envío del correo.",
        });
        continue;
      }

      success.push({ email });
    }

    return res.status(201).json({
      message: "Proceso completado.",
      successCount: success.length,
      errorsCount: errors.length,
      success,
      errors,
    });
  } catch (error) {
    console.error("Error en el registro masivo:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
