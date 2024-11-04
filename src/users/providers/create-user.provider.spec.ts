import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserProvider } from './create-user.provider';
import { MailService } from 'src/mail/providers/mail.service';
import { HashingProvider } from 'src/auth/provider/hasing.provider';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { BadRequestException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});
describe('CreateUserProvider', () => {
  let provider: CreateUserProvider;
  let usersRepository: MockRepository;
  const user = {
    firstName: 'jhon',
    lastName: 'doe',
    email: 'jhon@doe.com',
    password: 'password',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserProvider,
        //we are going to use jest native method in order to mock a repository
        { provide: DataSource, useValue: {} },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        {
          provide: MailService,
          useValue: { sendUserWelcome: jest.fn(() => Promise.resolve()) },
        },
        {
          provide: HashingProvider,
          useValue: { hashPassword: jest.fn(() => user.password) },
        },
      ],
    }).compile();
    provider = module.get<CreateUserProvider>(CreateUserProvider);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
  describe('createUser', () => {
    describe('when the user doesnot exist in the db', () => {
      it('should create a newUser', async () => {
        usersRepository.findOne.mockReturnValue(null);
        usersRepository.create.mockReturnValue(user);
        usersRepository.save.mockReturnValue(user);
        const newUser = await provider.createUser(user);
        expect(usersRepository.findOne).toHaveBeenCalledWith({
          where: { email: user.email },
        });
        expect(usersRepository.create).toHaveBeenCalledWith(user);
        expect(usersRepository.save).toHaveBeenCalledWith(user);
      });
    });
    describe('when the user does exist', () => {
      it('throw BadRequestException', async () => {
        usersRepository.findOne.mockReturnValue(user.email);
        usersRepository.create.mockReturnValue(user);
        usersRepository.save.mockReturnValue(user);
        try {
          const newUser = await provider.createUser(user);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
        }
      });
    });
  });
});

/*The test confirms that the CreateUserProvider
 class is properly instantiated with all its dependencies. 
 If any dependency were missing or incorrectly injected, the
  test would fail, indicating setup issues.
  we are going to use jest native method in order to mock a repository
  in order to make a repository we create a new type just above the 
  describe  block i'm going to call this as mock repository, now lets go ahead and 
  assign it a generaic T which would would be of any type
  we are going to make another descibe block since we are testing the user method 
  on createUserProvider, so lets add desciption as createUser and in this block we 
  have to create nest block
  */
