import { Test, TestingModule } from '@nestjs/testing';
import { Account, AccountRepository } from './account.repository';

describe('AccountRepository', () => {
  let repository: AccountRepository;
  let firstAccount: Account;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountRepository],
    }).compile();

    repository = module.get<AccountRepository>(AccountRepository);
    repository.clear(); // sempre começa limpo
    firstAccount = repository.newAccount(true)!;
  });

  describe('newAccount', () => {
    it('should generate incremental ids', () => {
      const account2 = repository.newAccount(false)!;
      expect(account2.id).toBe(firstAccount.id + 1);
    });

    it('should create account with saldo = 100 and ativa = true', () => {
      const account = repository.newAccount(true)!;
      expect(account).toEqual({
        id: firstAccount.id + 1,
        saldo: 100,
        ativa: true,
      });
    });

    it('should create account with ativa = false', () => {
      const account = repository.newAccount(false)!;
      expect(account.ativa).toBe(false);
    });
  });

  describe('accountExists', () => {
    it('should return true if account exists', () => {
      expect(repository.accountExists(firstAccount.id)).toBe(true);
    });

    it('should return false if account does not exist', () => {
      expect(repository.accountExists(999)).toBe(false);
    });
  });

  describe('getAccount', () => {
    it('should return account if it exists', () => {
      const result = repository.getAccount(firstAccount.id);
      expect(result).toEqual(firstAccount);
    });

    it('should return undefined if account does not exist', () => {
      const result = repository.getAccount(999);
      expect(result).toBeUndefined();
    });
  });

  describe('getAccounts', () => {
    beforeEach(() => {
      repository.newAccount(true);
      repository.newAccount(false);
    });

    it('should return all accounts if skip/take not provided', () => {
      const result = repository.getAccounts({});
      expect(result.length).toBe(3);
    });

    it('should return paginated accounts', () => {
      const result = repository.getAccounts({ skip: 1, take: 1 });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(firstAccount.id + 1);
    });

    it('should return empty array if out of range', () => {
      const result = repository.getAccounts({ skip: 99, take: 5 });
      expect(result).toEqual([]);
    });
  });

  describe('updateAccount', () => {
    it('should update existing account', () => {
      const updated: Account = {
        id: 0, // deve ser sobrescrito
        saldo: 500,
        ativa: false,
      };
      const result = repository.updateAccount(firstAccount.id, updated)!;
      expect(result).toEqual({ ...updated, id: firstAccount.id });
      expect(repository.getAccount(firstAccount.id)).toEqual(result);
    });

    it('should return undefined if account does not exist', () => {
      const result = repository.updateAccount(999, {
        id: 999,
        saldo: 200,
        ativa: true,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('deleteAccount', () => {
    it('should delete account and return true', () => {
      const deleted = repository.deleteAccount(firstAccount.id);
      expect(deleted).toBe(true);
      expect(repository.accountExists(firstAccount.id)).toBe(false);
    });

    it('should return false if account does not exist', () => {
      const deleted = repository.deleteAccount(999);
      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all accounts', () => {
      repository.clear();
      expect(repository.getAccounts({}).length).toBe(0);
    });
  });

  describe('generateId', () => {
    it('should return 1 if no accounts exist', () => {
      repository.clear();
      const id = repository.generateId();
      expect(id).toBe(1);
    });

    it('should return max id + 1 if accounts exist', () => {
      const account2 = repository.newAccount(true)!;
      const id = repository.generateId();
      expect(id).toBe(account2.id + 1);
    });
  });
});
