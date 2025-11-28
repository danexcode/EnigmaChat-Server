import { Strategy as LocalStrategy } from 'passport-local';
import { AuthService } from '@/services/auth.service';
import { AuditService } from '@/services/audit.service';
import { getIp } from '@/utils/audit';
import { Request } from 'express';

const authService = new AuthService();

// Estrategia de autenticación local
export const localStrategy = new LocalStrategy(
  {
    usernameField: 'email', // Campo que se usará como "username"
    passwordField: 'password', // Campo que se usará como "password"
    passReqToCallback: true, // Permite acceder al objeto req en el callback
  },
  async (req: Request, email: string, password: string, done: (error: any, user?: any, options?: any) => void) => {
    try {
      // Llama al servicio de autenticación para verificar las credenciales
      const user = await authService.login(email, password);
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      return done(null, user); // Usuario autenticado correctamente
    } catch (error) {
      // En caso de error, registra el log de auditoría
      AuditService.log({
        userId: null,
        action: 'FAILED_LOGIN',
        entity: 'user',
        entityId: null,
        details: { email },
        ipAddress: getIp(req),
      });
      return done(error, false); // Error durante la autenticación
    }
  }
);
