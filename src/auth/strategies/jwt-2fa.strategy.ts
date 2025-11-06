import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { config } from '@/config';
import { badImplementation } from '@hapi/boom';

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado Authorization
  secretOrKey: config.auth.jwt2faSecret || (() => {
    console.error("JWT secret is not defined")
    throw badImplementation('Internal server error');
  })(),
  passReqToCallback: true,
};

export const jwt2faStrategy = new JwtStrategy(options, async (req, payload, done) => {
  try {
    if (payload.purpose !== '2fa') {
      return done(null, false, { message: 'Invalid token purpose' });
    }
    // Si el token es válido, pasa el payload al siguiente middleware
    return done(null, payload);
  } catch (error) {
    // Si hay un error, pasa el error
    return done(error, false);
  }
});
