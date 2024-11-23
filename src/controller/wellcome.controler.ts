import { Response } from "express";

export const wellcome = (_: any, res: Response) => {
  res.json({
    mensaje: "¡Bienvenido a la API de Fonelli!",
    version: "1.0.0",
    descripcion:
      "Esta es la API oficial de Fonelli, diseñada para ofrecer servicios y funcionalidades excepcionales.",
    autor: "Equipo Fonelli",
  });
};
