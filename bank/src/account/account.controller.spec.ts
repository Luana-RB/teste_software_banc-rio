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
  };

  beforeEach(async () => {
    mockAccountService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      checkAccountStatus: jest.fn(),
      transfer: jest.fn(),
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

  describe('findAll', () => {
    it('should return all accounts', () => {
      const result = [{ id: 1 }, { id: 2 }];
      mockAccountService.findAll.mockResolvedValue(result);

      expect(controller.findAll()).toEqual(result);
      expect(mockAccountService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return one account by id', () => {
      const result = { id: 1 };
      mockAccountService.findOne.mockResolvedValue(result);

      expect(controller.findOne('1')).toEqual(result);
      expect(mockAccountService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('checkAccountStatus', () => {
    it('should return the status of the account', () => {
      const status = 'active';
      mockAccountService.checkAccountStatus.mockResolvedValue(status);

      expect(controller.checkAccountStatus('1')).toBe(status);
      expect(mockAccountService.checkAccountStatus).toHaveBeenCalledWith(1);
    });
  });

  describe('transfer', () => {
    it('should call transfer with correct data and return true', () => {
      const transferData = {
        idContaOrigem: 1,
        idContaDestino: 2,
        valor: 100,
      };

      mockAccountService.transfer.mockReturnValue(true);

      expect(controller.transfer(transferData)).toBe(true);
      expect(mockAccountService.transfer).toHaveBeenCalledWith(1, 2, 100);
    });
  });
});
