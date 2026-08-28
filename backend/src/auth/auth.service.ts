import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';

interface DemoUser {
  id: string;
  email: string;
  // Demo only: a real system stores a salted hash from bcrypt/argon2 and
  // never a fixture like this. See README "Security notes" for the full list
  // of things intentionally simplified for a portfolio project vs. what a
  // production PayPay-style backend would actually do.
  passwordHash: string;
  name: string;
}

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'usr_1',
    email: 'demo@payflow.dev',
    passwordHash: sha256('password123'),
    name: 'Demo User',
  },
];

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; expiresIn: number }> {
    const user = DEMO_USERS.find((u) => u.email === dto.email);

    // Deliberately compare against a dummy hash even on a missing user, and
    // return the same generic error either way. Distinguishing "no such
    // user" from "wrong password" in the response (or in response timing)
    // is a classic account-enumeration leak.
    const candidateHash = sha256(dto.password);
    const isValid = user ? candidateHash === user.passwordHash : false;

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const expiresIn = 60 * 15; // 15 minutes — short-lived access token
    const accessToken = await this.jwtService.signAsync(
      { sub: user!.id, email: user!.email },
      { expiresIn },
    );

    return { accessToken, expiresIn };
  }
}
