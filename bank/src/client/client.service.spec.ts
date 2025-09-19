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
  describe('create', () => {
    it('should return error if age not permited', () => {
      const clientsDto: CreateClientDto[] = [
        {
          name: '',
          age: 17,
          email: '',
          active: false,
          idAccount: 1,
        },
        {
          name: '',
          age: 66,
          email: '',
          active: false,
          idAccount: 2,
        },
        {
          name: 'nome',
          age: 30,
          email: 'l@gmail.com',
          active: false,
          idAccount: 3,
        },
      ];
      const account: CreateAccountDto = {};
      mockAccountRepository.newAccount.mockReturnValue(account);
      mockClientRepository.newClient.mockReturnValue(true);
      expect(() => service.create(clientsDto[0])).toThrow(
        AgeNotPermitedException,
      );
      expect(() => service.create(clientsDto[1])).toThrow(
        AgeNotPermitedException,
      );

      expect(service.create(clientsDto[2])).toEqual(true);

      expect(service.create(clientsDto[2])).toEqual(true);
    });
  });
});
