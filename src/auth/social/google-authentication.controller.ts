import { Body, Controller, Post } from '@nestjs/common';
import { GoogleAuthenticationService } from './provider/google-authentication.service';
import { GoogleTokenDto } from './dtos/google.token.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';

@Auth(AuthType.None)
//now our controller endponits does note auentication
@Controller('auth/google-authentication')
export class GoogleAuthenticationController {
  constructor(
    /**
     * inject googleAuthenticationService
     */
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post()
  public authenticate(@Body() googleTokenDto: GoogleTokenDto) {
    return this.googleAuthenticationService.authenticate(googleTokenDto);
  }
}
