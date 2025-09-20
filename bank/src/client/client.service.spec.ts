import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { ClientRepository } from './entity/client.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { AgeNotPermitedException } from '../exceptions/ageNotPermitedException';
import { AccountRepository } from '../account/entity/account.repository';
import { CreateAccountDto } from 'src/account/dto/create-account.dto';

describe('ClientService', () => {
  let service: ClientService;
  let mockClientRepository: {
    getClients: jest.Mock;
    newClient: jest.Mock;
    updateClient: jest.Mock;
  };
  let mockAccountRepository: {
    newAccount: jest.Mock;
  };

  // configuração inicial dos testes
  beforeEach(async () => {
    mockClientRepository = {
      getClients: jest.fn(),
      newClient: jest.fn(),
      updateClient: jest.fn(),
    };
    mockAccountRepository = {
      newAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: ClientRepository,
          useValue: mockClientRepository,
        },
        { provide: AccountRepository, useValue: mockAccountRepository },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  //teste Particionamento de Equivalência
  describe('Create', () => {
    describe('validateAge', () => {
      it('should throw if age < 18', () => {
        expect(() => service.validateAge(17)).toThrow(AgeNotPermitedException);
      });

      it('should throw if age > 65', () => {
        expect(() => service.validateAge(66)).toThrow(AgeNotPermitedException);
      });

      it('should return true if age between 18 and 65', () => {
        expect(service.validateAge(30)).toBe(true);
      });
    });

    describe('create', () => {
      it('should throw when creating client with age < 18 or > 65', () => {
        const clientsDto: CreateClientDto[] = [
          {
            name: 'a',
            age: 17,
            email: 'a@test.com',
            active: false,
            idAccount: 1,
          },
          {
            name: 'b',
            age: 66,
            email: 'b@test.com',
            active: false,
            idAccount: 2,
          },
        ];

        const account: CreateAccountDto = {};
        mockAccountRepository.newAccount.mockReturnValue(account);

        expect(() => service.create(clientsDto[0])).toThrow(
          AgeNotPermitedException,
        );
        expect(() => service.create(clientsDto[1])).toThrow(
          AgeNotPermitedException,
        );
      });

      it('should create client if age is valid (between 18 and 65)', () => {
        const clientDto: CreateClientDto = {
          name: 'c',
          age: 30,
          email: 'c@test.com',
          active: true,
          idAccount: 3,
        };

        const account: CreateAccountDto = { id: 10 };
        mockAccountRepository.newAccount.mockReturnValue(account);
        mockClientRepository.newClient.mockReturnValue(true);

        expect(service.create(clientDto)).toBe(true);
      });
    });
  });
});
