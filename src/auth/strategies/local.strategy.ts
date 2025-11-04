import { Strategy as LocalStrategy } from 'passport-local';
import { AuthService } from '@/services/auth.service';

const authService = new AuthService();

export const localStrategy = new LocalStrategy(
  {
    usernameField: 'email', // Campo que se usará como "username"
    passwordField: 'password', // Campo que se usará como "password"
  },
  async (email: string, password: string, done: (error: any, user?: any, options?: any) => void) => {
    try {
      // Llama al servicio de autenticación para verificar las credenciales
      const user = await authService.login(email, password);
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      return done(null, user); // Usuario autenticado correctamente
    } catch (error) {
      return done(error, false); // Error durante la autenticación
    }
  }
);
