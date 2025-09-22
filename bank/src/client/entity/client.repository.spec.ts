import { Test, TestingModule } from '@nestjs/testing';
import { Client, ClientRepository } from './client.repository';

describe('ClientRepository', () => {
  let repository: ClientRepository;
  let firstClient: Client;

  const mockClientData = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    active: true,
    idAccount: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientRepository],
    }).compile();

    repository = module.get<ClientRepository>(ClientRepository);
    repository.clear(); // sempre começa vazio
    firstClient = repository.newClient(mockClientData);
  });

  describe('newClient', () => {
    it('should create a new client with incremental id', () => {
      const second = repository.newClient({
        name: 'Jane Doe',
        age: 25,
        email: 'jane@example.com',
        active: false,
        idAccount: 2,
      });

      expect(second.id).toBe(firstClient.id + 1);
      expect(second.name).toBe('Jane Doe');
    });
  });

  describe('clientExists', () => {
    it('should return true if client exists', () => {
      expect(repository.clientExists(firstClient.id)).toBe(true);
    });

    it('should return false if client does not exist', () => {
      expect(repository.clientExists(999)).toBe(false);
    });
  });

  describe('getClient', () => {
    it('should return client by id', () => {
      const result = repository.getClient(firstClient.id);
      expect(result).toEqual(firstClient);
    });

    it('should return undefined if client not found', () => {
      expect(repository.getClient(999)).toBeUndefined();
    });
  });

  describe('getClientByAccountId', () => {
    it('should return client with given account id', () => {
      const result = repository.getClientByAccountId(firstClient.idAccount);
      expect(result).toEqual(firstClient);
    });

    it('should return undefined if no client with account id exists', () => {
      expect(repository.getClientByAccountId(999)).toBeUndefined();
    });
  });

  describe('getClients', () => {
    beforeEach(() => {
      repository.newClient({
        name: 'Alice',
        age: 22,
        email: 'alice@example.com',
        active: true,
        idAccount: 2,
      });
      repository.newClient({
        name: 'Bob',
        age: 28,
        email: 'bob@example.com',
        active: false,
        idAccount: 3,
      });
    });

    it('should return all clients if no pagination provided', () => {
      const result = repository.getClients({});
      expect(result.length).toBe(3);
    });

    it('should return paginated clients', () => {
      const result = repository.getClients({ skip: 1, take: 1 });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Alice');
    });

    it('should return empty array if out of range', () => {
      const result = repository.getClients({ skip: 99, take: 5 });
      expect(result).toEqual([]);
    });
  });

  describe('updateClient', () => {
    it('should update existing client', () => {
      const updated: Client = {
        id: 0, // será sobrescrito
        name: 'John Updated',
        age: 31,
        email: 'john.updated@example.com',
        active: false,
        idAccount: 99,
      };

      const result = repository.updateClient(firstClient.id, updated)!;
      expect(result).toEqual({ ...updated, id: firstClient.id });
      expect(repository.getClient(firstClient.id)).toEqual(result);
    });

    it('should return undefined if client does not exist', () => {
      const result = repository.updateClient(999, {
        id: 999,
        name: 'Ghost',
        age: 0,
        email: 'ghost@example.com',
        active: false,
        idAccount: -1,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('deleteClient', () => {
    it('should delete client and return true', () => {
      const deleted = repository.deleteClient(firstClient.id);
      expect(deleted).toBe(true);
      expect(repository.clientExists(firstClient.id)).toBe(false);
    });

    it('should return false if client does not exist', () => {
      expect(repository.deleteClient(999)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all clients', () => {
      repository.clear();
      expect(repository.getClients({}).length).toBe(0);
    });
  });
});
