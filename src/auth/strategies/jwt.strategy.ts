import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { config } from '@/config';
import { badImplementation } from '@hapi/boom';
import { prisma } from '@/server';

const options: StrategyOptions = {
  // Extrae el token del encabezado Authorization
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // Pasa el request al callback
  passReqToCallback: true,
  // Secret para verificar el token
  secretOrKey: config.auth.jwtSecret || (() => {
    console.error("JWT secret is not defined")
    throw badImplementation('Internal server error');
  })(),
};

export const jwtStrategy = new JwtStrategy(options, async (req, payload, done) => {
  try {
    if (payload.purpose !== 'auth') {
      return done(null, false, { message: 'Invalid token purpose' });
    }

    // Buscamos al usuario en la base de datos
    //TODO: Hacer esto con cache
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return done(null, false, { message: 'User not found' });
    }

    // Si el token es válido, pasa el payload al siguiente middleware
    return done(null, payload);
  } catch (error) {
    // Si hay un error, pasa el error
    return done(error, false);
  }
});
