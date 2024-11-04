import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { UserService } from 'src/users/providers/user.service';
import { HashingProvider } from './hasing.provider';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class SignInProvider {
  //we need the userservice to find one user by email with in the mthod that we had created
  constructor(
    /**
     * inject userService
     */
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    /**
     * Inject HashingProvider
     */

    private readonly hashingProvider: HashingProvider,

    /**
     * inject genrate Token provider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}
  public async signIn(signInDto: SignInDto) {
    //followig steps we should take to sign in the user
    //1-find the user using email id
    //2-thorw an exception if the user not found
    let user = await this.userService.findOneByEmail(signInDto.email);
    //3-if user found then copmare the password to hash

    let isEqual: boolean = false;
    try {
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare the passwords',
      });
    }
    if (!isEqual) {
      throw new UnauthorizedException('Incorrect Password');
    }
    return await this.generateTokensProvider.generateTokens(user);
  }
}
