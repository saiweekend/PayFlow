import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // In production this comes from a secrets manager (AWS Secrets
      // Manager / SSM), never a checked-in default. Failing loudly if it's
      // missing is deliberate — a payments API should not boot with a
      // guessable fallback secret.
      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  /** Whatever this returns becomes `request.user` in downstream handlers. */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === 'test') return 'test-secret-do-not-use-in-prod';
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
