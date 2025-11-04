import passport from "passport";
import { jwtStrategy } from "@/auth/strategies/jwt.strategy";
import { localStrategy } from "@/auth/strategies/local.strategy";

export const setupAuthStrategies = () => {
  passport.use(localStrategy);
  passport.use(jwtStrategy);
}
