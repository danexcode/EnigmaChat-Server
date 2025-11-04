import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { config } from '@/config';
import { badImplementation } from '@hapi/boom';

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado Authorization
  secretOrKey: config.auth.jwtSecret || (() => {
    console.error("JWT secret is not defined")
    throw badImplementation('Internal server error');
  })(), // Clave secreta para verificar el token
};

export const jwtStrategy = new JwtStrategy(options, async (payload, done) => {
  try {
    //TODO: Verificar si el usuario existe en la base de datos y si el token es válido
    return done(null, payload); // Si el token es válido, pasa el payload al siguiente middleware
  } catch (error) {
    return done(error, false); // Si hay un error, pasa el error
  }
});
