import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateGoogleUserProvider } from './create-google-user.provider';
import { FindOneByGoogleIdProvider } from './find-one-by-google-id.provider';
import { CreateUserProvider } from './create-user.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';
import { UserCreateManyProvider } from './user-create-many.provider';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  beforeEach(async () => {
    const mockCreateUserProvider: Partial<CreateUserProvider> = {
      createUser: (createUserDto: CreateUserDto) =>
        Promise.resolve({
          id: 12,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          password: createUserDto.password,
        }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: CreateUserProvider, useValue: mockCreateUserProvider },
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: CreateGoogleUserProvider, useValue: {} },
        { provide: FindOneByGoogleIdProvider, useValue: {} },
        { provide: FindOneUserByEmailProvider, useValue: {} },
        { provide: UserCreateManyProvider, useValue: {} },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  //now we are creating a describe block beacuse we are testing a sepcific method
  //inside our service
  describe('createUser', () => {
    it('should be defined', () => {
      expect(service.createUser).toBeDefined();
    });
    //2nd test we going to add whether the createUser mthod is accessed or not on createUser
    it('should call createUser on CreateUserProvider', async () => {
      //now we add one more test to check  whether creating a newUser on our service
      //actually goes ahead and fire a create user method
      let user = await service.createUser({
        firstName: 'jhon',
        lastName: 'nan',
        email: 'jhonnan.com',
        password: 'password',
      });
      expect(user.firstName).toEqual('jhon');
    });
  });
});
