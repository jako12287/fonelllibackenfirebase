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

// export const resgisterUser = async (req: Request, res: Response) => {
//   const { email, password, type, customerNumber } = req.body;
//   if (!email || !password || !type) {
//     return res
//       .status(400)
//       .json({ message: "Todos los campos son requeridos." });
//   }

//   const dataEmail: any = {
//     email,
//     password,
//   };

//   if (type === userType.CUSTOMER && customerNumber) {
//     dataEmail.customerNumber = customerNumber;
//   }

//   const usermailOptions: SendMailOptions = {
//     from: EMAIL,
//     to: email,
//     subject: "Bienvenido a Fonelli",
//     html: htmlContentUser(dataEmail),
//   };

//   try {
//     const db = admin.database();
//     const ref = db.ref("users");

//     const snapshot = await ref
//       .orderByChild("email")
//       .equalTo(email)
//       .once("value");
//     if (snapshot.exists()) {
//       return res
//         .status(400)
//         .json({ message: "El correo electrónico ya está registrado." });
//     }

//     const newUserRef = ref.push();

//     const dataNewUser: any = {
//       email,
//       password,
//       type,
//       orders: [],
//       verify: false,
//       changePass: 0,
//       sessionActive: false,
//       createdAt: admin.database.ServerValue.TIMESTAMP,
//     };
//     if (type === userType.CUSTOMER) {
//       dataNewUser.customerNumber = customerNumber;
//     }
//     try {
//       await newUserRef.set(dataNewUser);
//       console.log("Usuario creado en Firebase.");
//     } catch (error) {
//       console.error("Error al guardar usuario:", error);
//     }

//     try {
//       await transporter.sendMail(usermailOptions);
//       console.log("Correo enviado correctamente.");
//     } catch (error) {
//       console.error("Error al enviar correo:", error);
//     }

//     console.log("Respuesta que se devolverá:", {
//       message: "Usuario registrado correctamente ok.",
//       userId: newUserRef.key,
//       sendEmail: "creado",
//     });

//     return res.status(201).json({
//       message: "Usuario registrado correctamente ok.",
//       userId: newUserRef.key,
//       sendEmail: "creado",
//     });
//   } catch (error: any) {
//     console.error("Error al registrar usuario:", error);

//     // Manejo de errores comunes
//     if (error.code === "auth/email-already-exists") {
//       return res.status(400).json({ message: "El correo ya está registrado." });
//     }

//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };
export const resgisterUser = async (req: Request, res: Response) => {
  const { email = null, password, type, customerNumber } = req.body;

  // Verifica que al menos uno de los campos (email o customerNumber) esté presente
  if ((!email && !customerNumber) || !password || !type) {
    return res.status(400).json({
      message:
        "Se requiere al menos un correo electrónico o número de cliente, junto con contraseña y tipo.",
    });
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
    to: email || "", // Evitar enviar un correo nulo
    subject: "Bienvenido a Fonelli",
    html: htmlContentUser(dataEmail),
  };

  try {
    const db = admin.database();
    const ref = db.ref("users");

    // Verifica si el correo electrónico ya está registrado (solo si se proporciona)
    if (email) {
      const snapshot = await ref
        .orderByChild("email")
        .equalTo(email)
        .once("value");
      if (snapshot.exists()) {
        return res
          .status(400)
          .json({ message: "El correo electrónico ya está registrado." });
      }
    }

    const newUserRef = ref.push();

    const dataNewUser: any = {
      email,
      password,
      type,
      orders: [],
      verify: false,
      changePass: 0,
      sessionActive: false,
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

    // Enviar correo solo si el email está presente
    if (email) {
      try {
        await transporter.sendMail(usermailOptions);
        console.log("Correo enviado correctamente.");
      } catch (error) {
        console.error("Error al enviar correo:", error);
      }
    }

    console.log("Respuesta que se devolverá:", {
      message: "Usuario registrado correctamente ok.",
      userId: newUserRef.key,
      sendEmail: email ? "creado" : "no enviado",
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente ok.",
      userId: newUserRef.key,
      sendEmail: email ? "creado" : "no enviado",
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

// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const db = admin.database();
//     const ref = db.ref("users");

//     const snapshot = await ref.once("value");

//     if (!snapshot.exists()) {
//       return res.status(404).json({ message: "No se encontraron usuarios." });
//     }

//     const users: any[] = [];

//     snapshot.forEach((childSnapshot) => {
//       const user = childSnapshot.val();
//       users.push({
//         id: childSnapshot.key,
//         ...user,
//         orders: user.orders || [],
//       });
//     });

//     return res.status(200).json(users);
//   } catch (error) {
//     console.error("Error al obtener usuarios:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const db = admin.database();
    const ref = db.ref("users");

    const { limit = 20, startAfter } = req.query;

    let query = ref.orderByChild("createdAt").limitToFirst(Number(limit));

    if (startAfter) {
      query = query.startAfter(Number(startAfter));
    }

    const snapshot = await query.once("value");

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

    // Si quieres mandar también el último valor para la siguiente página
    const lastUser = users[users.length - 1];

    return res.status(200).json({
      users,
      nextPageToken: lastUser?.createdAt || null,
    });
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

// export const changeDataUser = async (req: Request, res: Response) => {
//   const { _id, email, password, type, customerNumber } = req.body;

//   if (!_id || (!email && !password && !type)) {
//     return res.status(400).json({
//       message:
//         "Se requiere al menos uno de los campos a actualizar (Email, Contraseña o Tipo de cuenta).",
//     });
//   }

//   try {
//     const db = admin.database();
//     const userRef = db.ref(`users/${_id}`);
//     const snapshot = await userRef.once("value");

//     if (!snapshot.exists()) {
//       return res.status(404).json({ message: "Usuario no encontrado." });
//     }

//     const updates: Record<string, any> = {};
//     if (email) updates.email = email;
//     if (password) {
//       updates.password = password;
//       updates.verify = false;
//     }
//     if (type) updates.type = type;
//     if (customerNumber && type === userType.CUSTOMER) {
//       updates.customerNumber = customerNumber;
//     }

//     await userRef.update(updates);

//     const userEmail = email || snapshot.val().email;

//     const dataEmail: any = {
//       email,
//       password: !password ? "La contraseña no se modificó" : password,
//     };

//     if (type === userType.CUSTOMER && customerNumber) {
//       dataEmail.customerNumber = customerNumber;
//     }

//     const userMailOptions: SendMailOptions = {
//       from: EMAIL,
//       to: userEmail,
//       subject: "Actualización de datos de tu cuenta",
//       html: htmlContentUpdateUser(dataEmail),
//     };

//     try {
//       await transporter.sendMail(userMailOptions);
//       console.log("Correo enviado correctamente al usuario.");
//     } catch (error) {
//       console.error("Error al enviar correo:", error);
//     }

//     return res.status(200).json({
//       message: "Datos del usuario actualizados correctamente.",
//     });
//   } catch (error) {
//     console.error("Error al actualizar datos del usuario:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };

export const changeDataUser = async (req: Request, res: Response) => {
  const { _id, email = null, password, type, customerNumber } = req.body;

  // Validar que se proporcione el ID y al menos un campo para actualizar
  if (!_id || (!email && !password && !type && !customerNumber)) {
    return res.status(400).json({
      message:
        "Se requiere el ID del usuario y al menos uno de los campos a actualizar (Email, Contraseña, Tipo de cuenta o Número de cliente).",
    });
  }

  try {
    const db = admin.database();
    const userRef = db.ref(`users/${_id}`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const currentData = snapshot.val();
    const updates: Record<string, any> = {};

    if (email) updates.email = email;
    if (password) {
      updates.password = password;
      updates.verify = false; // Se requiere verificación nuevamente
    }
    if (type) updates.type = type;
    if (customerNumber && type === userType.CUSTOMER) {
      updates.customerNumber = customerNumber;
    }

    // Actualizar los datos del usuario en la base de datos
    await userRef.update(updates);

    // Preparar datos para el correo electrónico
    const userEmail = email || currentData.email; // Usar el nuevo correo si se actualizó, sino el actual

    const dataEmail: any = {
      email: userEmail,
      password: password || "La contraseña no se modificó.",
      type: type || currentData.type,
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

    // Enviar correo solo si el correo electrónico es válido
    if (userEmail) {
      try {
        await transporter.sendMail(userMailOptions);
        console.log("Correo enviado correctamente al usuario.");
      } catch (error) {
        console.error("Error al enviar correo:", error);
      }
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

// export const registerMassiveUsers = async (req: Request, res: Response) => {
//   const file = req.file;
//   try {
//     if (!file) {
//       return res.status(400).json({ message: "Se requiere un archivo Excel." });
//     }
//     const workbook = XLSX.read(file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     if (!Array.isArray(data) || data.length === 0) {
//       return res.status(400).json({ message: "El archivo Excel está vacío." });
//     }
//     const db = admin.database();
//     const ref = db.ref("users");

//     const errors: any[] = [];
//     const success: any[] = [];

//     for (const row of data) {
//       const { email, password, type } = row as {
//         email: string;
//         password: string;
//         type: string;
//       };

//       if (!email || !password || !type) {
//         errors.push({ row, message: "Campos faltantes." });
//         continue;
//       }

//       if (!allowedUserTypes.includes(type as userType)) {
//         errors.push({
//           email,
//           message: `El tipo de usuario ${type} no es válido.`,
//         });
//         continue;
//       }

//       const snapshot = await ref
//         .orderByChild("email")
//         .equalTo(email)
//         .once("value");

//       if (snapshot.exists()) {
//         errors.push({ email, message: "Correo ya registrado." });
//         continue;
//       }

//       const newUserRef = ref.push();
//       await newUserRef.set({
//         email,
//         password,
//         type,
//         orders: [],
//         verify: false,
//         createdAt: admin.database.ServerValue.TIMESTAMP,
//       });

//       const userMailOptions: SendMailOptions = {
//         from: EMAIL,
//         to: email,
//         subject: "Bienvenido a Fonelli",
//         html: htmlContentUser({ email, password }),
//       };

//       try {
//         await transporter.sendMail(userMailOptions);
//         console.log(`Correo enviado correctamente a ${email}`);
//       } catch (error) {
//         console.error(`Error al enviar correo a ${email}:`, error);
//         errors.push({
//           email,
//           message: "Usuario creado, pero falló el envío del correo.",
//         });
//         continue;
//       }

//       success.push({ email });
//     }

//     return res.status(201).json({
//       message: "Proceso completado.",
//       successCount: success.length,
//       errorsCount: errors.length,
//       success,
//       errors,
//     });
//   } catch (error) {
//     console.error("Error en el registro masivo:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };

// export const registerMassiveUsers = async (req: Request, res: Response) => {
//   const file = req.file;
//   try {
//     if (!file) {
//       return res.status(400).json({ message: "Se requiere un archivo Excel." });
//     }

//     const workbook = XLSX.read(file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     if (!Array.isArray(data) || data.length === 0) {
//       return res.status(400).json({ message: "El archivo Excel está vacío." });
//     }

//     const db = admin.database();
//     const ref = db.ref("users");

//     const errors: any[] = [];
//     const success: any[] = [];

//     for (const row of data) {
//       const { email, password, type, customerNumber } = row as {
//         email?: string; // Email puede ser opcional para `customer`
//         password: string;
//         type: string;
//         customerNumber?: string; // Se requiere para `customer`
//       };

//       // Validación inicial según el tipo de usuario
//       if (type === userType.CUSTOMER) {
//         if (!customerNumber || !password) {
//           errors.push({
//             row,
//             message:
//               "El número de cliente y la contraseña son obligatorios para usuarios de tipo CUSTOMER.",
//           });
//           continue;
//         }
//       } else if (type === userType.COLLABORATOR) {
//         if (!email || !password) {
//           errors.push({
//             row,
//             message:
//               "El correo electrónico y la contraseña son obligatorios para usuarios de tipo COLLABORATOR.",
//           });
//           continue;
//         }
//       } else {
//         errors.push({
//           row,
//           message: `El tipo de usuario ${type} no es válido.`,
//         });
//         continue;
//       }

//       // Verifica si el correo electrónico ya está registrado (si se proporciona)
//       if (email) {
//         const snapshot = await ref
//           .orderByChild("email")
//           .equalTo(email)
//           .once("value");

//         if (snapshot.exists()) {
//           errors.push({ email, message: "Correo ya registrado." });
//           continue;
//         }
//       }

//       const newUserRef = ref.push();
//       const newUserData: any = {
//         email: email || null, // El email puede ser nulo para `customer`
//         password,
//         type,
//         orders: [],
//         verify: false,
//         createdAt: admin.database.ServerValue.TIMESTAMP,
//       };

//       if (type === userType.CUSTOMER) {
//         newUserData.customerNumber = customerNumber; // Agrega el número de cliente
//       }

//       await newUserRef.set(newUserData);

//       // Intentar enviar el correo solo si el email está presente
//       if (email) {
//         const userMailOptions: SendMailOptions = {
//           from: EMAIL,
//           to: email,
//           subject: "Bienvenido a Fonelli",
//           html: htmlContentUser({ email, password }),
//         };

//         try {
//           await transporter.sendMail(userMailOptions);
//           console.log(`Correo enviado correctamente a ${email}`);
//         } catch (error) {
//           console.error(`Error al enviar correo a ${email}:`, error);
//           errors.push({
//             email,
//             message: "Usuario creado, pero falló el envío del correo.",
//           });
//           continue;
//         }
//       }

//       success.push({ email, customerNumber });
//     }

//     return res.status(201).json({
//       message: "Proceso completado.",
//       successCount: success.length,
//       errorsCount: errors.length,
//       success,
//       errors,
//     });
//   } catch (error) {
//     console.error("Error en el registro masivo:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };

// export const registerMassiveUsers = async (req: Request, res: Response) => {
//   const file = req.file;
//   try {
//     if (!file) {
//       return res.status(400).json({ message: "Se requiere un archivo Excel." });
//     }

//     const workbook = XLSX.read(file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     if (!Array.isArray(data) || data.length === 0) {
//       return res.status(400).json({ message: "El archivo Excel está vacío." });
//     }

//     const db = admin.database();
//     const ref = db.ref("users");

//     const errors: any[] = [];
//     const success: any[] = [];

//     for (const row of data) {
//       const { email, password, type, customerNumber } = row as {
//         email?: string;
//         password: string;
//         type: string;
//         customerNumber?: string;
//       };

//       // Verificación de campos vacíos
//       if (!password || !type) {
//         errors.push({
//           row,
//           message: "Faltan campos obligatorios (contraseña o tipo).",
//         });
//         continue;
//       }

//       // Verificación de cliente (CUSTOMER)
//       if (type === userType.CUSTOMER) {
//         if (!customerNumber) {
//           errors.push({
//             row,
//             message:
//               "El número de cliente es obligatorio para usuarios de tipo Cliente.",
//           });
//           continue;
//         }

//         // Comprobar si el número de cliente ya está registrado
//         const customerSnapshot = await ref
//           .orderByChild("customerNumber")
//           .equalTo(customerNumber)
//           .once("value");

//         if (customerSnapshot.exists()) {
//           errors.push({
//             customerNumber,
//             message: "Número de cliente ya registrado.",
//           });
//           continue;
//         }
//       }
//       // Verificación de colaborador (COLLABORATOR)
//       else if (type === userType.COLLABORATOR) {
//         if (!email) {
//           errors.push({
//             row,
//             message:
//               "El correo electrónico es obligatorio para usuarios de tipo COLLABORATOR.",
//           });
//           continue;
//         }

//         // Comprobar si el correo electrónico ya está registrado
//         const snapshot = await ref
//           .orderByChild("email")
//           .equalTo(email)
//           .once("value");

//         if (snapshot.exists()) {
//           errors.push({ email, message: "Correo ya registrado." });
//           continue;
//         }
//       }
//       // Validación de tipo de usuario
//       else {
//         errors.push({
//           row,
//           message: `El tipo de usuario ${type} no es válido.`,
//         });
//         continue;
//       }

//       // Creación del nuevo usuario
//       const newUserRef = ref.push();
//       const newUserData: any = {
//         email: email || null, // Si es cliente, email puede ser null
//         password,
//         type,
//         orders: [],
//         verify: false,
//         sessionActive: false,
//         createdAt: admin.database.ServerValue.TIMESTAMP,
//       };

//       if (type === userType.CUSTOMER) {
//         newUserData.customerNumber = customerNumber;
//       }

//       // Guardar el nuevo usuario en la base de datos
//       await newUserRef.set(newUserData);

//       // Enviar correo si es necesario
//       if (email) {
//         const userMailOptions: SendMailOptions = {
//           from: EMAIL,
//           to: email,
//           subject: "Bienvenido a Fonelli",
//           html: htmlContentUser({ email, password }),
//         };

//         try {
//           await transporter.sendMail(userMailOptions);
//           console.log(`Correo enviado correctamente a ${email}`);
//         } catch (error) {
//           console.error(`Error al enviar correo a ${email}:`, error);
//           errors.push({
//             email,
//             message: "Usuario creado, pero falló el envío del correo.",
//           });
//         }
//       }

//       // Agregar el usuario a la lista de éxitos
//       success.push({ email, customerNumber });
//     }

//     // Respuesta al cliente
//     return res.status(201).json({
//       message: "Proceso completado.",
//       successCount: success.length,
//       errorsCount: errors.length,
//       success,
//       errors,
//     });
//   } catch (error) {
//     console.error("Error en el registro masivo:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };

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

    // Dividir en bloques de 180 usuarios
    const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    };

    const chunks = chunkArray(data, 180);

    for (let i = 0; i < chunks.length; i++) {
      const batch = chunks[i];
      console.log(`Procesando lote ${i + 1} de ${chunks.length}`);

      for (const row of batch) {
        const { email, password, type, customerNumber } = row as {
          email?: string;
          password: string;
          type: string;
          customerNumber?: string;
        };

        if (!password || !type) {
          errors.push({
            row,
            message: "Faltan campos obligatorios (contraseña o tipo).",
          });
          continue;
        }

        if (type === userType.CUSTOMER) {
          if (!customerNumber) {
            errors.push({
              row,
              message:
                "El número de cliente es obligatorio para usuarios de tipo Cliente.",
            });
            continue;
          }

          const customerSnapshot = await ref
            .orderByChild("customerNumber")
            .equalTo(customerNumber)
            .once("value");

          if (customerSnapshot.exists()) {
            errors.push({
              customerNumber,
              message: "Número de cliente ya registrado.",
            });
            continue;
          }
        } else if (type === userType.COLLABORATOR) {
          if (!email) {
            errors.push({
              row,
              message:
                "El correo electrónico es obligatorio para usuarios de tipo COLLABORATOR.",
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
        } else {
          errors.push({
            row,
            message: `El tipo de usuario ${type} no es válido.`,
          });
          continue;
        }

        const newUserRef = ref.push();
        const newUserData: any = {
          email: email || null,
          password,
          type,
          orders: [],
          verify: false,
          sessionActive: false,
          createdAt: admin.database.ServerValue.TIMESTAMP,
        };

        if (type === userType.CUSTOMER) {
          newUserData.customerNumber = customerNumber;
        }

        await newUserRef.set(newUserData);

        if (email) {
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
          }
        }

        success.push({ email, customerNumber });
      }

      // Espera opcional entre lotes (para evitar throttling)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return res.status(200).json({
      message: "Proceso de carga masiva finalizado.",
      success,
      errors,
    });
  } catch (error) {
    console.error("Error al procesar el archivo Excel:", error);
    return res.status(500).json({
      message: "Error al procesar el archivo Excel.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};


export const verifyPassword = async (req: Request, res: Response) => {
  const { id, password } = req.body;

  // Verificación de campos obligatorios
  if (!id || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios." });
  }

  try {
    const db = admin.database();
    const userRef = db.ref(`users/${id}`);
    const snapshot = await userRef.once("value");
    const userData = snapshot.val();

    // Verificar si el usuario existe
    if (!userData) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Comparar contraseñas
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // Contraseña correcta
    return res.status(200).json({ message: "Autenticación exitosa." });
  } catch (error) {
    console.error("Error al verificar la contraseña:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
