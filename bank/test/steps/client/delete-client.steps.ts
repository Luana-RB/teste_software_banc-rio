// test/steps/client/delete-client.steps.ts

import { loadFeature, defineFeature } from 'jest-cucumber';
import * as path from 'path';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { ClientRepository } from '../../../src/client/entity/client.repository';
import { AccountRepository } from '../../../src/account/entity/account.repository';
import { Client } from '../../../src/client/entity/client.repository';
import { Account } from '../../../src/account/entity/account.repository';

const feature = loadFeature(
  path.join(__dirname, '../../features/client/delete-client.feature'),
);

defineFeature(feature, (test) => {
  let app: INestApplication;
  let clientRepository: ClientRepository;
  let accountRepository: AccountRepository;
  let response: request.Response;

  let existingClient: Client;
  let existingAccount: Account;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    clientRepository = moduleFixture.get<ClientRepository>(ClientRepository);
    accountRepository = moduleFixture.get<AccountRepository>(AccountRepository);
  });

  beforeEach(() => {
    clientRepository.clear();
    accountRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  const background = (given) => {
    given(
      /^que o cliente com ID (.*), nome "(.*)", idade (.*), email "(.*)", status "(.*)" está cadastrado$/,
      (
        id: string,
        name: string,
        age: string,
        email: string,
        status: string,
      ) => {
        existingClient = {
          id: parseInt(id),
          name,
          age: parseInt(age),
          email,
          active: status === 'true',
          idAccount: 0,
        };
      },
    );

    given(
      /^o cliente com ID (.*) está associado à conta com ID (.*)$/,
      (clientId: string, accountId: string) => {
        existingAccount = {
          id: parseInt(accountId),
          saldo: 100,
          ativa: true,
        };
        existingClient.idAccount = existingAccount.id;

        accountRepository['accounts'].push(existingAccount);
        clientRepository['clients'].push(existingClient);
      },
    );
  };

  test('Remover um cliente existente com sucesso', ({
    given,
    when,
    then,
    and,
  }) => {
    background(given);

    when(
      /^uma requisição DELETE é enviada para "\/client\/(.*)"$/,
      async (id: string) => {
        response = await request(app.getHttpServer()).delete(`/client/${id}`);
      },
    );

    then(/^o status da resposta deve ser (\d+)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });

    and('o cliente com ID 1 não deve mais existir no sistema', () => {
      const client = clientRepository.getClient(existingClient.id);
      expect(client).toBeUndefined();
    });

    and('a conta com ID 101 também deve ser removida', () => {
      const account = accountRepository.getAccount(existingAccount.id);
      expect(account).toBeUndefined();
    });
  });

  test('Tentar remover um cliente inexistente', ({ when, then, and }) => {
    when(
      /^uma requisição DELETE é enviada para "\/client\/(.*)"$/,
      async (id: string) => {
        response = await request(app.getHttpServer()).delete(`/client/${id}`);
      },
    );

    then(/^o status da resposta deve ser (\d+)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (message: string) => {
      expect(response.body.message).toBe(message);
    });
  });

  test('Remover todos os clientes', ({ given, when, then, and }) => {
    given('que existem outros clientes cadastrados', () => {
      background(given);
    });

    when('uma requisição DELETE é enviada para "/client"', async () => {
      response = await request(app.getHttpServer()).delete('/client');
    });

    then(/^o status da resposta deve ser (\d+)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });

    and('não deve haver mais nenhum cliente cadastrado no sistema', () => {
      expect(clientRepository.getClients({})).toHaveLength(0);
    });
  });
});
