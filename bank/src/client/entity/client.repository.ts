import { Injectable } from '@nestjs/common';

// Deve ser como um DB, apenas funcoes basicas
@Injectable()
export class ClientRepository {
  private clients: Client[] = [];

  public newClient(client: Client): boolean {
    if (this.clientExists(client.id)) {
      return false;
    }
    this.clients.push(client);
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
}

export type Client = {
  id: number;
  name: string;
  age: number;
  email: string;
  active: boolean;
  idAccount: number;
};
