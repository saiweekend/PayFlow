import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Thin wrapper so routes can just do `@UseGuards(JwtAuthGuard)`. Kept as its
 * own class (rather than using AuthGuard('jwt') inline everywhere) so we have
 * one place to extend later — e.g. to check a token-revocation list before
 * trusting an otherwise-valid signature.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
