import passport from "passport";
import { jwtStrategy } from "@/auth/strategies/jwt.strategy";
import { localStrategy } from "@/auth/strategies/local.strategy";
import { jwt2faStrategy } from "@/auth/strategies/jwt-2fa.strategy";

export const setupAuthStrategies = () => {
  passport.use('local', localStrategy);
  passport.use('jwt', jwtStrategy);
  passport.use('jwt-2fa', jwt2faStrategy);
}
