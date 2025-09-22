import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountRepository } from '../account/entity/account.repository';
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

  beforeEach(() => {
    jest.clearAllMocks();
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
      mockAccountRepository.getAccount.mockReturnValue({ id: 1, ativa: true });

      expect(service.checkAccountStatus(1)).toBe(true);
    });

    it('should return false if account is inactive', () => {
      mockAccountRepository.getAccount.mockReturnValue({ id: 1, ativa: false });

      expect(service.checkAccountStatus(1)).toBe(false);
    });

    it('should throw NotFoundException if account does not exist', () => {
      mockAccountRepository.getAccount.mockReturnValue(null);

      expect(() => service.checkAccountStatus(1)).toThrow(NotFoundException);
    });
  });

  describe('deactivate and activate account', () => {
    const conta = { id: 1, ativa: true, saldo: 500 };

    it('should make conta.ativa be false when deactivated', () => {
      mockAccountRepository.getAccount.mockReturnValueOnce(conta);

      const result = service.desativaConta(1);

      expect(result).toBe(true);
      expect(conta.ativa).toEqual(false);
      expect(mockAccountRepository.updateAccount).toHaveBeenCalledWith(
        1,
        conta,
      );
    });
    it('should return false when deactivates non existed account', () => {
      mockAccountRepository.getAccount.mockReturnValueOnce(null);

      const result = service.desativaConta(100);

      expect(result).toBe(false);
    });

    it('should reactivate conta', () => {
      conta.ativa = false;
      mockAccountRepository.getAccount.mockReturnValue(conta);

      expect(conta.ativa).toEqual(false);

      const result = service.ativaConta(1);

      expect(result).toBe(true);
      expect(conta.ativa).toEqual(true);
      expect(mockAccountRepository.updateAccount).toHaveBeenCalledWith(
        1,
        conta,
      );
    });
    it('should return false when activates non existed account', () => {
      mockAccountRepository.getAccount.mockReturnValueOnce(null);

      const result = service.ativaConta(100);

      expect(result).toBe(false);
    });
  });

  describe('transfer', () => {
    it('should throw BadRequestException if valor <= 0', () => {
      expect(() => service.transfer(1, 2, 0)).toThrow(BadRequestException);
      expect(() => service.transfer(1, 2, 0)).toThrow(
        'Valor deve ser maior que zero',
      );
    });

    it('should throw BadRequestException if origin and destination are the same', () => {
      const contaOrigem = { id: 1, ativa: true, saldo: 500 };

      mockAccountRepository.getAccount.mockImplementation((id: number) => {
        if (id === 1) return contaOrigem;
        return null;
      });

      expect(() => service.transfer(1, 1, 100)).toThrow(BadRequestException);
      expect(() => service.transfer(1, 1, 100)).toThrow(
        'Contas de origem e destino não podem ser iguais',
      );
    });

    it('should throw NotFoundException if any account is not found', () => {
      const contaDestino = { id: 2, ativa: true, saldo: 200 };

      mockAccountRepository.getAccount.mockImplementation((id: number) => {
        if (id === 1) return null;
        if (id === 2) return contaDestino;
        return null;
      });

      expect(() => service.transfer(1, 3, 100)).toThrow(NotFoundException);
      expect(() => service.transfer(1, 3, 100)).toThrow(
        'Conta de origem ou destino não encontrada',
      );
    });

    it('should throw BadRequestException if any account is inactive', () => {
      const contaOrigem = { id: 1, ativa: false, saldo: 500 };
      const contaDestino = { id: 2, ativa: true, saldo: 200 };

      mockAccountRepository.getAccount.mockImplementation((id: number) => {
        if (id === 1) return contaOrigem;
        if (id === 2) return contaDestino;
        return null;
      });

      expect(() => service.transfer(1, 2, 100)).toThrow(BadRequestException);
      expect(() => service.transfer(1, 2, 100)).toThrow(
        'Uma das contas está inativa',
      );
    });

    it('should throw MethodNotAllowedException if saldo is insufficient', () => {
      const contaOrigem = { id: 1, ativa: true, saldo: 50 };
      const contaDestino = { id: 2, ativa: true, saldo: 200 };

      mockAccountRepository.getAccount.mockImplementation((id: number) => {
        if (id === 1) return contaOrigem;
        if (id === 2) return contaDestino;
        return null;
      });

      expect(() => service.transfer(1, 2, 100)).toThrow(
        MethodNotAllowedException,
      );
      expect(() => service.transfer(1, 2, 100)).toThrow(
        'Saldo insuficiente na conta de origem',
      );
    });

    it('should transfer successfully', () => {
      const contaOrigem = { id: 1, ativa: true, saldo: 500 };
      const contaDestino = { id: 2, ativa: true, saldo: 200 };

      mockAccountRepository.getAccount.mockImplementation((id: number) => {
        if (id === 1) return contaOrigem;
        if (id === 2) return contaDestino;
        return null;
      });

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
