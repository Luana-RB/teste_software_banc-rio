import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientRepository } from './entity/client.repository';
import { AccountRepository } from '../account/entity/account.repository';
import { AgeNotPermitedException } from 'src/exceptions/ageNotPermitedException';

@Injectable()
export class ClientService {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  create(createClientDto: CreateClientDto) {
    if (this.validateAge(createClientDto.age)) {
      const account = this.accountRepository.newAccount(createClientDto.active);
      if (!account) {
        throw new NotFoundException('Erro ao criar conta para o cliente');
      }
      createClientDto.idAccount = account.id;
      return this.clientRepository.newClient(createClientDto);
    }
  }

  findAll() {
    return this.clientRepository.getClients({});
  }

  // função implementada com IA
  listComplete() {
    const clients = this.clientRepository.getClients({});
    const accounts = this.accountRepository.getAccounts({});

    const completeList = clients.map((client) => {
      const account = accounts.find((acc) => acc.id === client.idAccount);
      return {
        ...client,
        account: account || null,
      };
    });

    return completeList;
  }

  findOne(id: number) {
    return this.clientRepository.getClient(id);
  }

  status(id: number) {
    const client = this.clientRepository.getClient(id);

    if (!client) {
      throw new NotFoundException(`Cliente ${id} não encontrado`);
    }

    return client.active;
  }

  validateAge(age: number) {
    if (age < 18 || age > 65) {
      throw new AgeNotPermitedException(`Idade não permitida: ${age}`);
    }
    return true;
  }

  remove(id: number) {
    const exclude = this.clientRepository.getClient(id);
    if (!exclude) {
      throw new NotFoundException(`Cliente ${id} não encontrado`);
    }

    const accountId = exclude.idAccount;
    this.accountRepository.deleteAccount(accountId);
    return this.clientRepository.deleteClient(id);
  }

  clear() {
    this.accountRepository.clear();
    return this.clientRepository.clear();
  }
}
