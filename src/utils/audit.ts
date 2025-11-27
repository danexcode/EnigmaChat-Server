import { Request } from "express";

// Obtiene la IP del cliente
export const getIp = (req: Request): string | undefined => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (typeof ip === 'string') {
    return ip;
  }
  else if (Array.isArray(ip)) {
    return ip[0];
  }

  return undefined;
};