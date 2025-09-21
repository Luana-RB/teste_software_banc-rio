import { loadFeature, defineFeature } from 'jest-cucumber';
import * as path from 'path';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import {
  AccountRepository,
  Account,
} from '../../../src/account/entity/account.repository';

const feature = loadFeature(
  path.join(__dirname, '../../features/account/list-account.feature'),
);

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repo: AccountRepository;
  let response: request.Response;
  let account: Account;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    repo = moduleFixture.get<AccountRepository>(AccountRepository);
  });

  beforeEach(() => {
    repo.clear();
  });
  afterAll(async () => {
    await app.close();
  });

  test('Listar todas as contas', ({ given, when, then }) => {
    given('que existem contas cadastradas', () => {
      repo.newAccount(true);
      repo.newAccount(false);
    });
    when('eu solicito a listagem de contas', async () => {
      response = await request(app.getHttpServer()).get('/account');
    });
    then('o sistema deve retornar a lista completa de contas', () => {
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  test('Buscar conta por ID existente', ({ given, when, then }) => {
    given(/^que existe uma conta com ID (\d+)$/, (id: string) => {
      account = { id: parseInt(id), saldo: 150, ativa: true };
      repo['accounts'].push(account);
    });

    when(/^eu consulto a conta pelo ID (\d+)$/, async (id: string) => {
      response = await request(app.getHttpServer()).get(`/account/${id}`);
    });

    then('o sistema deve retornar os dados da conta correspondente', () => {
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(account.id);
      expect(response.body.saldo).toBe(account.saldo);
      expect(response.body.ativa).toBe(account.ativa);
    });
  });

  test('Buscar conta inexistente', ({ given, when, then }) => {
    given(/^que não existe conta com ID (\d+)$/, (id: string) => {
      expect(repo.getAccount(parseInt(id))).toBeUndefined();
    });

    when(/^eu consulto a conta pelo ID (\d+)$/, async (id: string) => {
      response = await request(app.getHttpServer()).get(`/account/${id}`);
    });

    then(/^o sistema deve retornar um erro "(.*)"$/, (errorMessage: string) => {
      expect(response.status).toBe(404);
      expect(response.body.message).toBe(errorMessage);
    });
  });
});
