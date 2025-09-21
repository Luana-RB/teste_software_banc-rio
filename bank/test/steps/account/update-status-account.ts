import { loadFeature, defineFeature } from 'jest-cucumber';
import * as path from 'path';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { AccountRepository } from '../../../src/account/entity/account.repository';
import { Account } from '../../../src/account/entity/account.repository';

const feature = loadFeature(
  path.join(__dirname, '../../features/account/update-status-account.feature'),
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

  test('Desativar uma conta ativa', ({ given, when, then, and }) => {
    given('que a conta de ID 1 existe e está ativa', () => {
      account = repo.newAccount(true)!;
      expect(account.id).toBe(1);
      expect(account.ativa).toBe(true);
    });

    when('eu solicito a desativação da conta 1', async () => {
      response = await request(app.getHttpServer()).patch(
        `/account/${account.id}/deactivate`,
      );
    });

    then('a operação deve retornar "sucesso"', () => {
      expect(response.status).toBe(200);
      expect(response.body).toBe(true);
    });

    and('o status da conta 1 deve ser "inativo"', () => {
      const updatedAccount = repo.getAccount(account.id);
      expect(updatedAccount?.ativa).toBe(false);
    });
  });

  test('Ativar uma conta inativa', ({ given, when, then, and }) => {
    given('que a conta de ID 1 existe e está inativa', () => {
      account = repo.newAccount(false)!;
      expect(account.id).toBe(1);
      expect(account.ativa).toBe(false);
    });

    when('eu solicito a ativação da conta 1', async () => {
      response = await request(app.getHttpServer()).patch(
        `/account/${account.id}/activate`,
      );
    });

    then('a operação deve retornar "sucesso"', () => {
      expect(response.status).toBe(200);
      expect(response.body).toBe(true);
    });

    and('o status da conta 1 deve ser "ativo"', () => {
      const updatedAccount = repo.getAccount(account.id);
      expect(updatedAccount?.ativa).toBe(true);
    });
  });

  test('Tentar desativar uma conta inexistente', ({ given, when, then }) => {
    given('que a conta de ID 999 não existe', () => {
      expect(repo.getAccount(999)).toBeUndefined();
    });

    when('eu solicito a desativação da conta 999', async () => {
      response = await request(app.getHttpServer()).patch(
        '/account/999/deactivate',
      );
    });

    then('a operação deve retornar "falha"', () => {
      expect(response.status).toBe(200); // O controller retorna booleano, então o status é 200
      expect(response.body).toBe(false); // O resultado da operação é false
    });
  });

  test('Tentar ativar uma conta inexistente', ({ given, when, then }) => {
    given('que a conta de ID 999 não existe', () => {
      expect(repo.getAccount(999)).toBeUndefined();
    });

    when('eu solicito a ativação da conta 999', async () => {
      response = await request(app.getHttpServer()).patch(
        '/account/999/activate',
      );
    });

    then('a operação deve retornar "falha"', () => {
      expect(response.status).toBe(200);
      expect(response.body).toBe(false);
    });
  });
});
