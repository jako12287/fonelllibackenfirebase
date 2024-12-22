import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { stateType } from "../types/models/userModel";

// Crear una nueva orden
// export const createOrder = async (req: Request, res: Response) => {
//   const {
//     userId,
//     email,
//     model,
//     caratage,
//     color,
//     rock,
//     observations,
//     size,
//     long,
//     initialName,
//     name,
//     totalPieces,
//   } = req.body;

//   // Validar campos obligatorios
//   if (!userId || !model || !caratage || !color || !email) {
//     return res.status(400).json({
//       message:
//         "Los campos obligatorios (userId, model, caratage, color, email) son requeridos.",
//     });
//   }

//   try {
//     const db = admin.database();
//     const ordersRef = db.ref("orders");

//     // Crear una nueva referencia para la orden
//     const newOrderRef = ordersRef.push();

//     // Normalizar los campos opcionales
//     const normalizeField = (field: any): any[] | null =>
//       Array.isArray(field) ? field : null;

//     // Construir el objeto de la nueva orden dinámicamente
//     const newOrder: Record<string, any> = {
//       userId,
//       model,
//       email,
//       caratage,
//       color,
//       observations: observations || "",
//       size: normalizeField(size),
//       long: normalizeField(long),
//       initialName: normalizeField(initialName),
//       name: normalizeField(name),
//       totalPieces: totalPieces || null,
//       createdAt: admin.database.ServerValue.TIMESTAMP,
//       status: stateType.PENDING,
//       statusAdmin: stateType.PENDING,
//     };

//     // Si `rock` viene en la solicitud, se agrega al objeto
//     if (Array.isArray(rock)) {
//       newOrder.rock = rock;
//     }

//     // Guardar la orden en la base de datos
//     await newOrderRef.set(newOrder);

//     // Verificar los usuarios de tipo ADMIN y COLLABORATOR y obtener sus tokens
//     const usersRef = db.ref("users");
//     const usersSnapshot = await usersRef.once("value");

//     if (!usersSnapshot.exists()) {
//       console.log("No se encontraron usuarios.");
//       return res.status(201).json({
//         message:
//           "Orden creada exitosamente, pero no se encontraron usuarios para notificar.",
//       });
//     }

//     const tokens: string[] = [];

//     usersSnapshot.forEach((childSnapshot) => {
//       const userData = childSnapshot.val();
//       if (
//         (userData.type === "ADMIN" || userData.type === "COLLABORATOR") &&
//         userData.notificationToken
//       ) {
//         tokens.push(userData.notificationToken);
//       }
//     });

//     console.log("Tokens encontrados:", tokens);

//     // Enviar notificación push a los tokens obtenidos
//     if (tokens.length > 0) {
//       for (const token of tokens) {
//         const message = {
//           notification: {
//             title: "Nueva Orden Creada",
//             body: `Se ha creado una nueva orden para el usuario ${email}.`,
//           },
//           token, // Token individual
//         };

//         try {
//           const response = await admin.messaging().send(message);
//           console.log(
//             `Notificación enviada exitosamente al token ${token}:`,
//             response
//           );
//         } catch (error) {
//           console.error(
//             `Error al enviar notificación al token ${token}:`,
//             error
//           );
//         }
//       }
//     } else {
//       console.log(
//         "No se encontraron tokens de notificación para los usuarios."
//       );
//     }

//     // Devolver respuesta exitosa
//     return res.status(201).json({
//       message: "Orden creada exitosamente.",
//       orderId: newOrderRef.key,
//       order: newOrder,
//     });
//   } catch (error) {
//     console.error("Error al crear la orden:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };
export const createOrder = async (req: Request, res: Response) => {
  const {
    userId,
    email,
    model,
    caratage,
    color,
    rock,
    observations,
    size,
    long,
    initialName,
    name,
    totalPieces,
  } = req.body;

  // Validar campos obligatorios
  if (!userId || !model || !caratage || !color || !email) {
    return res.status(400).json({
      message:
        "Los campos obligatorios (userId, model, caratage, color, email) son requeridos.",
    });
  }

  try {
    const db = admin.database();
    const ordersRef = db.ref("orders");

    // Crear una nueva referencia para la orden
    const newOrderRef = ordersRef.push();

    // Normalizar los campos opcionales
    const normalizeField = (field: any): any[] | null =>
      Array.isArray(field) ? field : null;

    // Construir el objeto de la nueva orden dinámicamente
    const newOrder: Record<string, any> = {
      userId,
      model,
      email,
      caratage,
      color,
      observations: observations || "",
      size: normalizeField(size),
      long: normalizeField(long),
      initialName: normalizeField(initialName),
      name: normalizeField(name),
      totalPieces: totalPieces || null,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      status: stateType.PENDING,
      statusAdmin: stateType.PENDING,
    };

    // Si `rock` viene en la solicitud, se agrega al objeto
    if (Array.isArray(rock)) {
      newOrder.rock = rock;
    }

    // Guardar la orden en la base de datos
    await newOrderRef.set(newOrder);

    // Verificar los usuarios de tipo ADMIN y COLLABORATOR y obtener sus tokens
    const usersRef = db.ref("users");
    const usersSnapshot = await usersRef.once("value");

    if (!usersSnapshot.exists()) {
      console.log("No se encontraron usuarios.");
      return res.status(201).json({
        message:
          "Orden creada exitosamente, pero no se encontraron usuarios para notificar.",
      });
    }

    const tokens: string[] = [];

    usersSnapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val();
      if (
        (userData.type === "ADMIN" || userData.type === "COLLABORATOR") &&
        Array.isArray(userData.notificationTokens)
      ) {
        tokens.push(...userData.notificationTokens);
      }
    });

    console.log("Tokens encontrados:", tokens);

    // Enviar notificaciones push a los tokens obtenidos
    if (tokens.length > 0) {
      for (const token of tokens) {
        const message: any = {
          token,
          notification: {
            title: "Nueva Orden Creada",
            body: `Se ha creado una nueva orden para el usuario ${email}.`,
          },
          webpush: {
            fcm_options: {
              link: "https://www.fonellipedidos.com",
            },
          },
        };

        try {
          const response = await admin.messaging().send(message);
          console.log(
            `Notificación enviada exitosamente al token ${token}:`,
            response
          );
        } catch (error) {
          console.error(
            `Error al enviar notificación al token ${token}:`,
            error
          );
        }
      }
    } else {
      console.log(
        "No se encontraron tokens de notificación para los usuarios."
      );
    }

    // Devolver respuesta exitosa
    return res.status(201).json({
      message: "Orden creada exitosamente.",
      orderId: newOrderRef.key,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener todas las órdenes
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const db = admin.database();
    const ordersRef = db.ref("orders");

    // Obtener todas las órdenes de la base de datos
    const snapshot = await ordersRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No se encontraron órdenes." });
    }

    // Convertir los datos de Firebase en un array
    const orders: Array<{ id: string; [key: string]: any }> = [];
    snapshot.forEach((childSnapshot) => {
      orders.push({
        id: childSnapshot.key, // Incluye el ID único de la orden
        ...childSnapshot.val(),
      });
    });

    // Devolver las órdenes en la respuesta
    return res
      .status(200)
      .json({ message: "Órdenes obtenidas con éxito.", orders });
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener órdenes por ID de usuario
export const getOrdersByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Validar que se envíe el userId
  if (!userId) {
    return res.status(400).json({ message: "El userId es obligatorio." });
  }

  try {
    const db = admin.database();
    const ordersRef = db.ref("orders");

    // Filtrar órdenes por userId
    const snapshot = await ordersRef
      .orderByChild("userId")
      .equalTo(userId)
      .once("value");

    if (!snapshot.exists()) {
      return res
        .status(404)
        .json({ message: "No se encontraron órdenes para este usuario." });
    }

    // Convertir los datos de Firebase en un array
    const orders: Array<{ id: string; [key: string]: any }> = [];
    snapshot.forEach((childSnapshot) => {
      orders.push({
        id: childSnapshot.key, // Incluye el ID único de la orden
        ...childSnapshot.val(),
      });
    });

    // Devolver las órdenes del usuario en la respuesta
    return res
      .status(200)
      .json({ message: "Órdenes obtenidas con éxito.", orders });
  } catch (error) {
    console.error("Error al obtener las órdenes por userId:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Eliminar una orden por ID
export const deleteOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  // Validar que se envíe el orderId
  if (!orderId) {
    return res.status(400).json({ message: "El orderId es obligatorio." });
  }

  try {
    const db = admin.database();
    const orderRef = db.ref(`orders/${orderId}`);

    // Verificar si la orden existe
    const snapshot = await orderRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "La orden no existe." });
    }

    // Eliminar la orden
    await orderRef.remove();

    // Respuesta exitosa
    return res.status(200).json({ message: "Orden eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar la orden:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Editar una orden por ID
export const updateOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const updatedData = req.body;

  // Validar que se envíe el orderId
  if (!orderId) {
    return res.status(400).json({ message: "El orderId es obligatorio." });
  }

  // Validar que se envíen datos para actualizar
  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res
      .status(400)
      .json({ message: "No se enviaron datos para actualizar." });
  }

  try {
    const db = admin.database();
    const orderRef = db.ref(`orders/${orderId}`);

    // Verificar si la orden existe
    const snapshot = await orderRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "La orden no existe." });
    }

    // Actualizar la orden con los datos proporcionados
    await orderRef.update(updatedData);

    // Obtener los datos actualizados para devolver en la respuesta
    const updatedOrder = (await orderRef.once("value")).val();

    // Respuesta exitosa
    return res.status(200).json({
      message: "Orden actualizada exitosamente.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error al actualizar la orden:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Editar el status de una orden por ID

// export const updateOrderStatus = async (req: Request, res: Response) => {
//   const { orderId } = req.params;
//   const { status } = req.body;

//   // Validar que se envíe el orderId y el status
//   if (!orderId) {
//     return res.status(400).json({ message: "El orderId es obligatorio." });
//   }
//   if (!status) {
//     return res.status(400).json({ message: "El campo status es obligatorio." });
//   }

//   // Validar que el status sea un valor válido
//   const validStatuses = ["Pendiente", "En proceso", "Completada", "Cancelada"];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({
//       message: `El valor del status debe ser uno de los siguientes: ${validStatuses.join(
//         ", "
//       )}`,
//     });
//   }

//   try {
//     const db = admin.database();
//     const orderRef = db.ref(`orders/${orderId}`);

//     // Verificar si la orden existe
//     const snapshot = await orderRef.once("value");

//     if (!snapshot.exists()) {
//       return res.status(404).json({ message: "La orden no existe." });
//     }

//     // Obtener el userId de la orden
//     const order = snapshot.val();
//     const userId = order.userId;

//     // Verificar si el userId existe
//     const userRef = db.ref(`users/${userId}`);
//     const userSnapshot = await userRef.once("value");

//     if (!userSnapshot.exists()) {
//       return res.status(404).json({ message: "Usuario no encontrado." });
//     }

//     // Obtener el notificationToken del usuario
//     const user = userSnapshot.val();
//     const notificationToken = user.notificationToken;
//     console.log(
//       "TCL: updateOrderStatus -> notificationToken del user",
//       notificationToken
//     );

//     if (!notificationToken) {
//       return res
//         .status(400)
//         .json({ message: "El usuario no tiene token de notificación." });
//     }

//     // Actualizar el status de la orden
//     await orderRef.update({ status });

//     // Obtener la orden actualizada
//     const updatedOrder = (await orderRef.once("value")).val();

//     // Enviar notificación FCM al usuario
//     const message = {
//       notification: {
//         title: "Actualización de Orden",
//         body: `El estado de tu orden ha sido actualizado a: ${status}`,
//       },
//       token: notificationToken,
//     };

//     await admin.messaging().send(message);

//     // Respuesta exitosa
//     return res.status(200).json({
//       message:
//         "Status de la orden actualizado exitosamente y notificación enviada.",
//       order: updatedOrder,
//     });
//   } catch (error) {
//     console.error("Error al actualizar el status de la orden:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validar que se envíe el orderId y el status
  if (!orderId) {
    return res.status(400).json({ message: "El orderId es obligatorio." });
  }
  if (!status) {
    return res.status(400).json({ message: "El campo status es obligatorio." });
  }

  // Validar que el status sea un valor válido
  const validStatuses = ["Pendiente", "En proceso", "Completada", "Cancelada"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `El valor del status debe ser uno de los siguientes: ${validStatuses.join(
        ", "
      )}`,
    });
  }

  try {
    const db = admin.database();
    const orderRef = db.ref(`orders/${orderId}`);

    // Verificar si la orden existe
    const snapshot = await orderRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ message: "La orden no existe." });
    }

    // Obtener el userId de la orden
    const order = snapshot.val();
    const userId = order.userId;

    // Verificar si el userId existe
    const userRef = db.ref(`users/${userId}`);
    const userSnapshot = await userRef.once("value");
    if (!userSnapshot.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Obtener los notificationTokens del usuario
    const user = userSnapshot.val();
    const notificationTokens: string[] = user.notificationTokens || [];
    console.log("Tokens encontrados para el usuario:", notificationTokens);

    if (notificationTokens.length === 0) {
      return res
        .status(400)
        .json({ message: "El usuario no tiene tokens de notificación." });
    }

    // Actualizar el status de la orden
    await orderRef.update({ status });

    // Obtener la orden actualizada
    const updatedOrder = (await orderRef.once("value")).val();

    // Enviar notificaciones FCM a todos los tokens del usuario
    for (const token of notificationTokens) {
      const message = {
        notification: {
          title: "Actualización de Orden",
          body: `El estado de tu orden ha sido actualizado a: ${status}`,
        },
        token,
      };

      try {
        const response = await admin.messaging().send(message);
        console.log(`Notificación enviada exitosamente al token ${token}:`, response);
      } catch (error) {
        console.error(`Error al enviar notificación al token ${token}:`, error);
      }
    }

    // Respuesta exitosa
    return res.status(200).json({
      message:
        "Status de la orden actualizado exitosamente y notificaciones enviadas.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error al actualizar el status de la orden:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};


// export const updateOrderStatus = async (req: Request, res: Response) => {
//   const { orderId } = req.params;
//   const { status } = req.body;

//   // Validar que se envíe el orderId y el status
//   if (!orderId) {
//     return res.status(400).json({ message: "El orderId es obligatorio." });
//   }
//   if (!status) {
//     return res.status(400).json({ message: "El campo status es obligatorio." });
//   }

//   // Validar que el status sea un valor válido (puedes personalizar esto según los valores que pueda tomar el status)
//   const validStatuses = ["Pendiente", "En proceso", "Completada", "Cancelada"];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({
//       message: `El valor del status debe ser uno de los siguientes: ${validStatuses.join(
//         ", "
//       )}`,
//     });
//   }

//   try {
//     const db = admin.database();
//     const orderRef = db.ref(`orders/${orderId}`);

//     // Verificar si la orden existe
//     const snapshot = await orderRef.once("value");

//     if (!snapshot.exists()) {
//       return res.status(404).json({ message: "La orden no existe." });
//     }

//     // Actualizar el status de la orden
//     await orderRef.update({ status });

//     // Obtener la orden actualizada
//     const updatedOrder = (await orderRef.once("value")).val();

//     // Respuesta exitosa
//     return res.status(200).json({
//       message: "Status de la orden actualizado exitosamente.",
//       order: updatedOrder,
//     });
//   } catch (error) {
//     console.error("Error al actualizar el status de la orden:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };

export const updateOrderStatusAdmin = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { statusAdmin } = req.body;

  // Validar que se envíe el orderId y el statusAdmin
  if (!orderId) {
    return res.status(400).json({ message: "El orderId es obligatorio." });
  }
  if (!statusAdmin) {
    return res
      .status(400)
      .json({ message: "El campo statusAdmin es obligatorio." });
  }

  // Validar que el statusAdmin sea un valor válido (personalizar según tu lógica)
  const validAdminStatuses = ["PENDING", "CAUGHT", "DOWNLOAD"];
  if (!validAdminStatuses.includes(statusAdmin)) {
    return res.status(400).json({
      message: `El valor del statusAdmin debe ser uno de los siguientes: ${validAdminStatuses.join(
        ", "
      )}`,
    });
  }

  try {
    const db = admin.database();
    const orderRef = db.ref(`orders/${orderId}`);

    // Verificar si la orden existe
    const snapshot = await orderRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "La orden no existe." });
    }

    // Actualizar el statusAdmin de la orden
    await orderRef.update({ statusAdmin });
    if (statusAdmin === "CAUGHT") {
      await orderRef.update({ status: "CAUGHT" });
    }

    // Obtener la orden actualizada
    const updatedOrder = (await orderRef.once("value")).val();

    // Respuesta exitosa
    return res.status(200).json({
      message: "StatusAdmin de la orden actualizado exitosamente.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error al actualizar el statusAdmin de la orden:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener una orden por ID
export const getOrderById = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  // Validar que se envíe el orderId
  if (!orderId) {
    return res.status(400).json({ message: "El orderId es obligatorio." });
  }

  try {
    const db = admin.database();
    const orderRef = db.ref(`orders/${orderId}`);

    // Obtener los datos de la orden
    const snapshot = await orderRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "La orden no existe." });
    }

    // Devolver la orden encontrada
    const order = snapshot.val();
    return res
      .status(200)
      .json({ message: "Orden obtenida con éxito.", order });
  } catch (error) {
    console.error("Error al obtener la orden por ID:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const addFolioToOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { folio } = req.body;

  // Validar que se envíe el orderId y el folio
  if (!orderId) {
    return res.status(400).json({ message: "El orderId es obligatorio." });
  }
  if (!folio) {
    return res.status(400).json({ message: "El campo folio es obligatorio." });
  }

  try {
    const db = admin.database();
    const orderRef = db.ref(`orders/${orderId}`);

    // Verificar si la orden existe
    const snapshot = await orderRef.once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ message: "La orden no existe." });
    }

    // Obtener el userId de la orden
    const order = snapshot.val();
    const userId = order.userId;

    // Verificar si el userId existe
    const userRef = db.ref(`users/${userId}`);
    const userSnapshot = await userRef.once("value");

    if (!userSnapshot.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Obtener el notificationToken del usuario
    const user = userSnapshot.val();
    const notificationToken = user.notificationToken;

    if (!notificationToken) {
      return res
        .status(400)
        .json({ message: "El usuario no tiene token de notificación." });
    }

    // Actualizar el campo folio de la orden
    await orderRef.update({ folio });

    // Obtener la orden actualizada
    const updatedOrder = (await orderRef.once("value")).val();

    // Enviar notificación FCM al usuario
    const message = {
      notification: {
        title: "Tu orden cambio de estado",
        body: `Tu orden con id ${orderId} ha cambiado de estado exitosamente con folio #: ${folio}`,
      },
      token: notificationToken,
    };

    await admin.messaging().send(message);

    // Respuesta exitosa
    return res.status(200).json({
      message: "Folio agregado exitosamente a la orden y notificación enviada.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error al adicionar el folio a la orden:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// export const addFolioToOrder = async (req: Request, res: Response) => {
//   const { orderId } = req.params;
//   const { folio } = req.body;

//   // Validar que se envíe el orderId y el folio
//   if (!orderId) {
//     return res.status(400).json({ message: "El orderId es obligatorio." });
//   }
//   if (!folio) {
//     return res.status(400).json({ message: "El campo folio es obligatorio." });
//   }

//   try {
//     const db = admin.database();
//     const orderRef = db.ref(`orders/${orderId}`);

//     // Verificar si la orden existe
//     const snapshot = await orderRef.once("value");
//     if (!snapshot.exists()) {
//       return res.status(404).json({ message: "La orden no existe." });
//     }

//     // Actualizar el campo folio de la orden
//     await orderRef.update({ folio });

//     // Obtener la orden actualizada
//     const updatedOrder = (await orderRef.once("value")).val();

//     // Respuesta exitosa
//     return res.status(200).json({
//       message: "Folio agregado exitosamente a la orden.",
//       order: updatedOrder,
//     });
//   } catch (error) {
//     console.error("Error al adicionar el folio a la orden:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };

// Guardar el token de notificación del usuario
// export const saveNotificationToken = async (req: Request, res: Response) => {
//   const { userId, token } = req.body;

//   // Validar los campos obligatorios
//   if (!userId || !token) {
//     return res.status(400).json({
//       message: "Los campos 'userId' y 'token' son requeridos.",
//     });
//   }

//   try {
//     const db = admin.database();
//     const tokensRef = db.ref(`tokens/${userId}`);

//     // Obtener los tokens existentes del usuario
//     const tokensSnapshot = await tokensRef.once("value");
//     let existingTokens: string[] = tokensSnapshot.val() || [];

//     // Si el token no está en la lista, agregarlo
//     if (!existingTokens.includes(token)) {
//       existingTokens.push(token);
//       await tokensRef.set(existingTokens); // Guardar los tokens actualizados
//     }

//     return res.status(200).json({
//       message: "Token de notificación guardado exitosamente.",
//       userId,
//       tokens: existingTokens,
//     });
//   } catch (error) {
//     console.error("Error al guardar el token de notificación:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };

// export const saveNotificationToken = async (req: Request, res: Response) => {
//   const { userId, token } = req.body;

//   // Validar los campos obligatorios
//   if (!userId || !token) {
//     return res.status(400).json({
//       message: "Los campos 'userId' y 'token' son requeridos.",
//     });
//   }

//   try {
//     const db = admin.database();
//     const userProfileRef = db.ref(`users/${userId}`);

//     // Obtener el perfil del usuario
//     const userProfileSnapshot = await userProfileRef.once("value");
//     if (!userProfileSnapshot.exists()) {
//       return res.status(404).json({ message: "El usuario no existe." });
//     }

//     // Actualizar el token en el perfil del usuario
//     await userProfileRef.update({ notificationToken: token });

//     return res.status(200).json({
//       message: "Token de notificación guardado exitosamente.",
//       userId,
//       notificationToken: token,
//     });
//   } catch (error) {
//     console.error("Error al guardar el token de notificación:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// };
export const saveNotificationToken = async (req: Request, res: Response) => {
  const { userId, token } = req.body;

  // Validar los campos obligatorios
  if (!userId || !token) {
    return res.status(400).json({
      message: "Los campos 'userId' y 'token' son requeridos.",
    });
  }

  try {
    const db = admin.database();
    const userProfileRef = db.ref(`users/${userId}`);

    // Obtener el perfil del usuario
    const userProfileSnapshot = await userProfileRef.once("value");
    if (!userProfileSnapshot.exists()) {
      return res.status(404).json({ message: "El usuario no existe." });
    }

    // Obtener los tokens actuales (si existen)
    const currentTokens =
      userProfileSnapshot.child("notificationTokens").val() || [];

    // Verificar si el token ya existe para evitar duplicados
    if (!currentTokens.includes(token)) {
      currentTokens.push(token);

      // Guardar la lista actualizada de tokens
      await userProfileRef.update({ notificationTokens: currentTokens });
    }

    return res.status(200).json({
      message: "Token de notificación guardado exitosamente.",
      userId,
      notificationTokens: currentTokens,
    });
  } catch (error) {
    console.error("Error al guardar el token de notificación:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Controlador para enviar un mensaje de prueba
export const testMessage = async (req: Request, res: Response) => {
  const { token, message } = req.body;

  // Validar campos obligatorios
  if (!token || !message) {
    return res.status(400).json({
      message: "Los campos 'token' y 'message' son requeridos.",
    });
  }

  try {
    // Construir el mensaje
    const payload = {
      notification: {
        title: "Mensaje de prueba",
        body: message,
      },
      token, // Token individual proporcionado
    };

    // Enviar el mensaje usando Firebase Admin SDK
    const response = await admin.messaging().send(payload);

    console.log(`Notificación enviada exitosamente: ${response}`);

    // Responder al cliente
    return res.status(200).json({
      message: "Notificación enviada exitosamente.",
      response,
    });
  } catch (error: any) {
    console.error("Error al enviar la notificación:", error);
    return res.status(500).json({
      message: "Error al enviar la notificación.",
      error: error.message || "Error desconocido",
    });
  }
};
