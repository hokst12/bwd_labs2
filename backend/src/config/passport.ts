import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import User from '@/models/User';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  id: number;
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
  new JwtStrategy(options, async (payload: JwtPayload, done) => {
    try {
      const user = await User.findByPk(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }),
);

export default passport;
