import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientController } from './client.controller';

describe('ClientService', () => {
  let service: ClientController;
  let mockClientService: {
    create: jest.Mock;
    getClient: jest.Mock;
    updateClient: jest.Mock;
  };

  // configuração inicial dos testes
  beforeEach(async () => {
    mockClientService = {
      create: jest.fn(),
      getClient: jest.fn(),
      updateClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientController,
        {
          provide: ClientService,
          useValue: mockClientService,
        },
      ],
    }).compile();

    service = module.get<ClientController>(ClientController);
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
      mockClientService.create.mockReturnValue(true);

      expect(service.create(clientsDto[2])).toEqual(true);
    });
  });
});
