import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from 'src/auth/config/jwt.config';
import { GoogleTokenDto } from '../dtos/google.token.dto';
import { UserService } from 'src/users/providers/user.service';
import { GenerateTokensProvider } from 'src/auth/provider/generate-tokens.provider';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;
  constructor(
    /**
     * inject jwt configuration
     */
    //since it is a module type so we use config type
    //and config type take a genric which needs a type of configuration that you want
    //to inject & in our case we want to inject the jwt config
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    /**
     * Inject usersService
     */

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    /**
     * Inject genrate Token provider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}
  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }
  public async authenticate(googleTokenDto: GoogleTokenDto) {
    try {
      // 1-verify the Google token that is sent to us by the User
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleTokenDto.token,
      });
      console.log(loginTicket);
      //2-Extract the Payload from Google Jwt
      //extract sub from the payload as googleId & get this payload we again
      //use the login ticket that we just extracted over here which is your json webtoken
      //&lets get trigger a method on called getpayload
      const {
        email,
        sub: googleId,
        given_name: firstName,
        family_name: lastName,
      } = loginTicket.getPayload();
      //since we have extracted the googleId the user above of the line now we do the following procedure
      //3-Find the user in the db using Google Id
      const user = await this.userService.findOneByGoogleId(googleId);
      //4-If the googleId exists generate the token
      //1st check if the user was returned and is not null
      if (user) {
        this.generateTokensProvider.generateTokens(user);
      }
      //5-If user doesnot exist create new user & then generate token
      const newUser = await this.userService.createGoogleUser({
        email: email,
        firstName: firstName,
        lastName: lastName,
        googleId: googleId,
      });
      return this.generateTokensProvider.generateTokens(newUser);
    } catch (error) {
      //6-Finally if we fail to authorize the   google token or extract
      //the payload or any of this step fails go ahead and send an unauthorization exception
      throw new UnauthorizedException(error);
    }
  }
}
