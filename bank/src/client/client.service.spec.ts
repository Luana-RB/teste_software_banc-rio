import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { ClientRepository } from './entity/client.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { AgeNotPermitedException } from 'src/exceptions/ageNotPermitedException';

describe('ClientService', () => {
  let service: ClientService;
  let mockClientRepository: {
    getClients: jest.Mock;
    getClient: jest.Mock;
    updateClient: jest.Mock;
  };

  // configuração inicial dos testes
  beforeEach(async () => {
    mockClientRepository = {
      getClients: jest.fn(),
      getClient: jest.fn(),
      updateClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: ClientRepository,
          useValue: mockClientRepository,
        },
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
          name: '',
          age: 30,
          email: '',
          active: false,
          idAccount: 3,
        },
      ];
      expect(service.create(clientsDto[0])).toThrow(AgeNotPermitedException);
      expect(service.create(clientsDto[1])).toThrow(AgeNotPermitedException);
      expect(service.create(clientsDto[2])).toBe(true);
    });
  });
});
