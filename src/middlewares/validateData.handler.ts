import { badRequest, badImplementation } from "@hapi/boom";
import { Request, Response, NextFunction } from "express"; // Importa los tipos de Express
import { Schema } from "joi"; // Importa los tipos de Joi

export const validateDataHandler = (schema: Schema, property: keyof Request) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Obtiene los datos de la propiedad especificada (body, params, query, etc.)
    const data = req[property];
    if (!data) {
      console.error(`Bad Request: Missing property: ${String(property)}`);
      return next(badRequest(`Missing property: ${String(property)}`));
    }

    // Valida los datos utilizando el esquema de Joi
    const { error } = schema.validate(data, { abortEarly: false });

    // Si hay un error de validación, pasa el error a la siguiente función de middleware
    if (error) {
      next(badRequest(error));
    } else {
      // Si no hay errores, continúa con el siguiente middleware
      next();
    }
  };
};
