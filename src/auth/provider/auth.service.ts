import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { UserService } from 'src/users/providers/user.service';
import { SignInDto } from '../dtos/signin.dto';
import { SignInProvider } from './sign-in.provider.service';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';

@Injectable()
export class AuthService {
  constructor(
    // injecting user service
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    /**
     * Inject signIn provider
     */
    private readonly signInProvider: SignInProvider,
    /**
     * Inject refresh Token providers
     */
    private readonly refreshTokensProvider: RefreshTokensProvider,
  ) {} // till now this is a plain intermodule dependency injection

  public async signIn(signInDto: SignInDto) {
    return await this.signInProvider.signIn(signInDto);
  }
  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokensProvider.refreshTokens(refreshTokenDto);
  }
}
