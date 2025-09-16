import { Injectable } from '@nestjs/common';
import { CreateClientDto } from '../dto/create-client.dto';

// Deve ser como um DB, apenas funcoes basicas
@Injectable()
export class ClientRepository {
  private clients: Client[] = [];

  public newClient(client: CreateClientDto): boolean {
    this.clients.push({ id: this.generateId(), ...client });
    return true;
  }

  public clientExists(clientId: number): boolean {
    return this.clients.some((client) => client.id === clientId);
  }

  public getClient(clientId: number): Client | undefined {
    return this.clients.find((client) => client.id === clientId);
  }

  public getClientByAccountId(accountId: number): Client | undefined {
    return this.clients.find((client) => client.idAccount === accountId);
  }

  public getClients({
    skip,
    take,
  }: {
    skip?: number;
    take?: number;
  }): Client[] {
    if (skip === undefined || take === undefined) {
      return this.clients;
    }
    return this.clients.slice(skip, skip + take);
  }

  public updateClient(
    clientId: number,
    clientData: Client,
  ): Client | undefined {
    const existingClient = this.getClient(clientId);
    if (!existingClient) {
      return undefined;
    }

    const clientIndex = this.clients.findIndex(
      (client) => client.id === clientId,
    );
    if (clientIndex === -1) {
      return undefined;
    }
    clientData.id = clientId;
    this.clients[clientIndex] = clientData;
    return clientData;
  }

  public deleteClient(clientId: number): boolean {
    const clientIndex = this.clients.findIndex(
      (client) => client.id === clientId,
    );
    if (clientIndex === -1) {
      return false;
    }
    this.clients.splice(clientIndex, 1);
    return true;
  }

  public clear(): void {
    this.clients = [];
  }

  private generateId(): number {
    return this.clients.length > 0
      ? Math.max(...this.clients.map((client) => client.id)) + 1
      : 1;
  }
}

export type Client = {
  id: number;
  name: string;
  age: number;
  email: string;
  active: boolean;
  idAccount: number;
};
