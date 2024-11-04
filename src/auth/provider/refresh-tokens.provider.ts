import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { UserService } from 'src/users/providers/user.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    /**
     * inject jwt service
     */
    private readonly jwtService: JwtService,

    /**
     * inject jwt configfiguration
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    /**
     * inject generate token provider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,
    /**
     * Inject UserService
     */
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}
  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      //verify the refreh token using jwtService

      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });
      //fetch the user from database
      const user = await this.userService.findOneById(sub);
      // generate the tokens
      return await this.generateTokensProvider.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
