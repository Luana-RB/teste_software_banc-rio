import { loadFeature, defineFeature } from 'jest-cucumber';
import * as path from 'path';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { AccountRepository } from '../../../src/account/entity/account.repository';
import { Account } from '../../../src/account/entity/account.repository';

const feature = loadFeature(
  path.join(__dirname, '../../features/account/check-status-account.feature'),
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

  test('Conta ativa', ({ given, when, then }) => {
    given(/^que a conta de ID (\d+) está ativa$/, (id: string) => {
      const account: Account = { id: parseInt(id), saldo: 100, ativa: true };
      repo['accounts'].push(account); // Força o estado no repositório
    });

    when(/^eu consulto o status da conta (\d+)$/, async (id: string) => {
      response = await request(app.getHttpServer()).get(
        `/account/${id}/status`,
      );
    });

    then('o sistema deve retornar "ativa"', () => {
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true); // <-- Verifica a propriedade 'status'
    });
  });

  test('Conta inativa', ({ given, when, then }) => {
    given(/^que a conta de ID (\d+) está inativa$/, (id: string) => {
      const account: Account = { id: parseInt(id), saldo: 100, ativa: false };
      repo['accounts'].push(account); // Força o estado no repositório
    });

    when(/^eu consulto o status da conta (\d+)$/, async (id: string) => {
      response = await request(app.getHttpServer()).get(
        `/account/${id}/status`,
      );
    });

    then('o sistema deve retornar "inativa"', () => {
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(false); // <-- Verifica a propriedade 'status'
    });
  });

  test('Conta inexistente', ({ given, when, then }) => {
    given(/^que não existe conta com ID (\d+)$/, (id: string) => {
      expect(repo.getAccount(parseInt(id))).toBeUndefined();
    });

    when(/^eu consulto o status da conta (\d+)$/, async (id: string) => {
      response = await request(app.getHttpServer()).get(
        `/account/${id}/status`,
      );
    });

    then(/^o sistema deve retornar um erro "(.*)"$/, (errorMessage: string) => {
      expect(response.status).toBe(404);
      expect(response.body.message).toBe(errorMessage);
    });
  });
});
