import { loadFeature, defineFeature } from 'jest-cucumber';
import * as path from 'path';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { ClientRepository } from '../../../src/client/entity/client.repository';
import { AccountRepository } from '../../../src/account/entity/account.repository';

const feature = loadFeature(
  path.join(__dirname, '../../features/client/list-client.feature'),
);

defineFeature(feature, (test) => {
  let app: INestApplication;
  let clientRepository: ClientRepository;
  let accountRepository: AccountRepository;
  let response: request.Response;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    clientRepository = moduleFixture.get<ClientRepository>(ClientRepository);
    accountRepository = moduleFixture.get<AccountRepository>(AccountRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    clientRepository.clear();
    accountRepository.clear();
  });

  test('Consultar um cliente existente por ID', ({
    given,
    when,
    then,
    and,
  }) => {
    given(
      /^que o cliente com ID (.*), nome "(.*)", idade (.*), email "(.*)", está cadastrado e associado à conta com ID (.*)$/,
      (clientId, name, age, email, accountId) => {
        accountRepository['accounts'].push({
          id: parseInt(accountId),
          saldo: 100,
          ativa: true,
        });
        clientRepository['clients'].push({
          id: parseInt(clientId),
          name,
          age: parseInt(age),
          email,
          active: true,
          idAccount: parseInt(accountId),
        });
      },
    );
    when(/^uma requisição GET é enviada para "\/client\/(.*)"$/, async (id) => {
      response = await request(app.getHttpServer()).get(`/client/${id}`);
    });
    then(/^o status da resposta deve ser (\d+)$/, (status) => {
      expect(response.status).toBe(parseInt(status));
    });
    and(/^a resposta deve conter os dados do cliente com ID (.*)$/, (id) => {
      expect(response.body.id).toBe(parseInt(id));
    });
  });

  test('Tentar consultar um cliente inexistente por ID', ({
    when,
    then,
    and,
  }) => {
    when(/^uma requisição GET é enviada para "\/client\/(.*)"$/, async (id) => {
      response = await request(app.getHttpServer()).get(`/client/${id}`);
    });
    then(/^o status da resposta deve ser (\d+)$/, (status) => {
      expect(response.status).toBe(parseInt(status));
    });
    and(/^a mensagem de erro deve ser "(.*)"$/, (message) => {
      expect(response.body.message).toContain('não encontrado');
    });
  });

  test('Listar todos os clientes cadastrados', ({ given, and, when, then }) => {
    given(
      /^que o cliente com ID (.*), nome "(.*)", idade (.*), email "(.*)", está cadastrado e associado à conta com ID (.*)$/,
      (clientId, name, age, email, accountId) => {
        accountRepository['accounts'].push({
          id: parseInt(accountId),
          saldo: 100,
          ativa: true,
        });
        clientRepository['clients'].push({
          id: parseInt(clientId),
          name,
          age: parseInt(age),
          email,
          active: true,
          idAccount: parseInt(accountId),
        });
      },
    );
    and(
      /^o cliente com ID (.*), nome "(.*)", idade (.*), email "(.*)", está cadastrado e associado à conta com ID (.*)$/,
      (clientId, name, age, email, accountId) => {
        accountRepository['accounts'].push({
          id: parseInt(accountId),
          saldo: 200,
          ativa: true,
        });
        clientRepository['clients'].push({
          id: parseInt(clientId),
          name,
          age: parseInt(age),
          email,
          active: true,
          idAccount: parseInt(accountId),
        });
      },
    );
    when('uma requisição GET é enviada para "/client"', async () => {
      response = await request(app.getHttpServer()).get('/client');
    });
    then(/^o status da resposta deve ser (\d+)$/, (status) => {
      expect(response.status).toBe(parseInt(status));
    });
    and(/^a resposta deve ser uma lista contendo (\d+) clientes$/, (count) => {
      expect(response.body).toHaveLength(parseInt(count));
    });
  });

  test('Listar clientes com os dados completos das contas', ({
    given,
    when,
    then,
    and,
  }) => {
    given('que já existem clientes vinculados a contas', () => {
      accountRepository['accounts'].push({ id: 101, saldo: 150, ativa: true });
      clientRepository['clients'].push({
        id: 1,
        name: 'Cliente Completo',
        age: 33,
        email: 'cc@email.com',
        active: true,
        idAccount: 101,
      });
    });
    when(
      'uma requisição GET é enviada para "/client/list/complete"',
      async () => {
        response = await request(app.getHttpServer()).get(
          '/client/list/complete',
        );
      },
    );
    then(/^o status da resposta deve ser (\d+)$/, (status) => {
      expect(response.status).toBe(parseInt(status));
    });
    and(
      'a resposta deve ser uma lista de clientes, onde cada cliente possui os dados de sua conta aninhados',
      () => {
        expect(response.body[0].account).toBeDefined();
        expect(response.body[0].account.id).toBe(101);
      },
    );
  });

  test('Listar clientes quando não há nenhum cadastrado', ({
    given,
    when,
    then,
    and,
  }) => {
    given('que não há clientes cadastrados no sistema', () => {});
    when('uma requisição GET é enviada para "/client"', async () => {
      response = await request(app.getHttpServer()).get('/client');
    });
    then(/^o status da resposta deve ser (\d+)$/, (status) => {
      expect(response.status).toBe(parseInt(status));
    });
    and('a resposta deve ser uma lista vazia', () => {
      expect(response.body).toHaveLength(0);
    });
  });
});
