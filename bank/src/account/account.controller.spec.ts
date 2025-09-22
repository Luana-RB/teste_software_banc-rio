import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

describe('AccountController', () => {
  let controller: AccountController;
  let mockAccountService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    checkAccountStatus: jest.Mock;
    transfer: jest.Mock;
    desativaConta: jest.Mock;
    ativaConta: jest.Mock;
  };

  // configuração inicial dos testes
  beforeEach(async () => {
    mockAccountService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      checkAccountStatus: jest.fn(),
      transfer: jest.fn(),
      desativaConta: jest.fn(),
      ativaConta: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  // teste de busca de todas as contas
  describe('findAll', () => {
    it('should return all accounts', () => {
      const result = [{ id: 1 }, { id: 2 }];
      mockAccountService.findAll.mockReturnValue(result);

      const response = controller.findAll();
      expect(response).toEqual(result);
      expect(mockAccountService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  // teste de busca por ID
  describe('findOne', () => {
    it('should return one account by id', () => {
      const result = { id: 1 };
      mockAccountService.findOne.mockReturnValue(result);

      const response = controller.findOne('1');
      expect(response).toEqual(result);
      expect(mockAccountService.findOne).toHaveBeenCalledWith(1);
    });
  });

  // teste de verificação do status da conta
  describe('checkAccountStatus', () => {
    it('should return the status of the account', () => {
      const status = true;
      mockAccountService.checkAccountStatus.mockReturnValue(status);
      const result = controller.checkAccountStatus('1');
      expect(result).toEqual({ status: true });
      expect(mockAccountService.checkAccountStatus).toHaveBeenCalledWith(1);
    });
  });
  describe('desactivate', () => {
    it('should call service when desactivates account', () => {
      mockAccountService.desativaConta.mockReturnValue(true);
      controller.deactivateAccount('1');
      expect(mockAccountService.desativaConta).toHaveBeenCalled();
    });
  });
  describe('activate', () => {
    it('should call service when activates account', () => {
      mockAccountService.ativaConta.mockReturnValue(true);
      controller.activateAccount('1');
      expect(mockAccountService.ativaConta).toHaveBeenCalled();
    });
  });
  // teste de transferência entre contas
  describe('transfer', () => {
    it('should call transfer with correct data and return true', () => {
      const transferData = {
        idContaOrigem: 1,
        idContaDestino: 2,
        valor: 100,
      };

      mockAccountService.transfer.mockReturnValue(true);
      const result = controller.transfer(transferData);
      expect(result).toBe(true);
      expect(mockAccountService.transfer).toHaveBeenCalledWith(1, 2, 100);
    });
  });
});
