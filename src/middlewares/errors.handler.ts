import { Request, Response, NextFunction, ErrorRequestHandler } from "express"; // Importa los tipos de Express
import { Prisma } from "@prisma/client"; // Importa los errores de Prisma

// Maneja errores generados por Boom
export const boomErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err && err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload); // Responde con el error de Boom
  } else {
    next(err); // Pasa el error al siguiente middleware
  }
};

// Maneja errores de Prisma
export const ormErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Check if it's a Prisma error either by instanceof or by checking error properties
  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientRustPanicError ||
    (err && err.code && err.code.startsWith('P'))  // Prisma error codes start with P
  ) {
    console.error('Prisma Error:', err); // Log for debugging

    // Handle specific Prisma error codes
    if (err.code === 'P2002') {
      // Unique constraint violation
      res.status(409).json({
        statusCode: 409,
        error: "Conflict",
        message: "A record with this data already exists",
      });
    } else if (err.code === 'P2025') {
      // Record not found
      res.status(404).json({
        statusCode: 404,
        error: "Not Found",
        message: "The requested record was not found"
      });
    } else if (err.code === 'P2003') {
      // Foreign key constraint failed
      res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid reference to a related record",
      });
    } else {
      // Default Prisma error response
      res.status(500).json({
        statusCode: 500,
        error: "Database Error",
        message: "An error occurred while processing your request"
      });
    }
  } else {
    next(err); // Pass the error to the next middleware if not a Prisma error
  }
};

// Maneja errores no controlados
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err); // Log para depuración

  const response = {
    statusCode: err.status || 500,
    errorCode: err.errorCode || 'Internal Server Error',
    error: "Internal Server Error",
    message: err.message || 'An unexpected error occurred.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }), // En desarrollo, se devuelve el stacktrace para depuración
  };

  console.error(response);
  res.status(err.status || 500).json({
    statusCode: err.status || 500,
    error: "Internal Server Error",
    message: 'An unexpected error occurred.', // En desarrollo, se devuelve el stacktrace para depuración
  });
};
