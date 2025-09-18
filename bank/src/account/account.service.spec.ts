import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountRepository } from './entity/account.repository';
import {
  BadRequestException,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';

describe('AccountService', () => {
  let service: AccountService;
  let mockAccountRepository: {
    getAccounts: jest.Mock;
    getAccount: jest.Mock;
    updateAccount: jest.Mock;
  };

  beforeEach(async () => {
    mockAccountRepository = {
      getAccounts: jest.fn(),
      getAccount: jest.fn(),
      updateAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  describe('findAll', () => {
    it('should return all accounts', () => {
      const accounts = [{ id: 1 }, { id: 2 }];
      mockAccountRepository.getAccounts.mockReturnValue(accounts);

      expect(service.findAll()).toEqual(accounts);
      expect(mockAccountRepository.getAccounts).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return one account by ID', () => {
      const account = { id: 1 };
      mockAccountRepository.getAccount.mockReturnValue(account);

      expect(service.findOne(1)).toEqual(account);
      expect(mockAccountRepository.getAccount).toHaveBeenCalledWith(1);
    });
  });

  describe('checkAccountStatus', () => {
    it('should return true if account is active', () => {
      mockAccountRepository.getAccount.mockReturnValue({ ativa: true });

      expect(service.checkAccountStatus(1)).toBe(true);
    });
    it('should return false if account is inactive', () => {
      mockAccountRepository.getAccount.mockReturnValue({ ativa: false });

      expect(service.checkAccountStatus(1)).toBe(false);
    });

    it('should throw NotFoundException if account does not exist', () => {
      mockAccountRepository.getAccount.mockReturnValue(null);

      expect(() => service.checkAccountStatus(1)).toThrow(NotFoundException);
    });
  });
  //teste de transição de estado
  describe('deactivate and activate account', () => {
    const conta = { id: 1, ativa: true, saldo: 500 };
    it('should make conta.ativa be false when deactivated', () => {
      mockAccountRepository.getAccount.mockReturnValueOnce({ ...conta });
      const result = service.desativaConta(1);
      expect(result).toBe(true);
      expect(conta.ativa).toEqual(false);
    });
    it('should reactivate conta', () => {
      mockAccountRepository.getAccount.mockReturnValueOnce({ ...conta });
      service.desativaConta(1);
      const result = service.ativaConta(1);
      expect(result).toBe(true);
      expect(conta.ativa).toEqual(true);
    });
  });
  //teste de ramificação
  describe('transfer', () => {
    const contaOrigem = { id: 1, ativa: true, saldo: 500 };
    const contaDestino = { id: 2, ativa: true, saldo: 200 };

    it('should throw BadRequestException if valor <= 0', async () => {
      await expect(service.transfer(1, 2, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if origin and destination are the same', async () => {
      mockAccountRepository.getAccount
        .mockReturnValueOnce(contaOrigem)
        .mockReturnValueOnce(contaOrigem);

      await expect(service.transfer(1, 1, 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if any account is not found', async () => {
      mockAccountRepository.getAccount
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(contaDestino);

      await expect(service.transfer(1, 2, 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if any account is inactive', async () => {
      mockAccountRepository.getAccount
        .mockReturnValueOnce({ ...contaOrigem, ativa: false })
        .mockReturnValueOnce(contaDestino);

      await expect(service.transfer(1, 2, 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw MethodNotAllowedException if saldo is insufficient', async () => {
      mockAccountRepository.getAccount
        .mockReturnValueOnce({ ...contaOrigem, saldo: 50 })
        .mockReturnValueOnce(contaDestino);

      await expect(service.transfer(1, 2, 100)).rejects.toThrow(
        MethodNotAllowedException,
      );
    });

    it('should transfer successfully', () => {
      mockAccountRepository.getAccount
        .mockReturnValueOnce({ ...contaOrigem })
        .mockReturnValueOnce({ ...contaDestino });

      const result = service.transfer(1, 2, 100);

      expect(result).toBe(true);
      expect(mockAccountRepository.updateAccount).toHaveBeenCalledTimes(2);
      expect(mockAccountRepository.updateAccount).toHaveBeenCalledWith(1, {
        ...contaOrigem,
        saldo: 400,
      });
      expect(mockAccountRepository.updateAccount).toHaveBeenCalledWith(2, {
        ...contaDestino,
        saldo: 300,
      });
    });
  });
});
