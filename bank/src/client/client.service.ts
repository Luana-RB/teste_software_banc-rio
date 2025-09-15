import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientRepository } from './entity/client.repository';
import { AccountRepository } from 'src/account/entity/account.repository';

@Injectable()
export class ClientService {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  create(createClientDto: CreateClientDto) {
    return this.clientRepository.newClient(createClientDto);
  }

  findAll() {
    return this.clientRepository.getClients({});
  }

  findOne(id: number) {
    return this.clientRepository.getClient(id);
  }

  status(id: number) {
    const client = this.clientRepository.getClient(id);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client.active;
  }

  // update(id: number, updateClientDto: UpdateClientDto) {
  //   return `This action updates a #${id} client`;
  // }

  remove(id: number) {
    const exclude = this.clientRepository.getClient(id);
    if (!exclude) {
      throw new NotFoundException('Client not found');
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
