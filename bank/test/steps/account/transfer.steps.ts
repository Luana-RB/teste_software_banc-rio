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
  path.join(__dirname, '../../features/account/transfer-account.feature'),
);

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repo: AccountRepository;
  let response: request.Response;

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

  const setupAccount = (
    id: string,
    saldo: string,
    status: 'ativa' | 'inativa' | string = 'ativa',
  ) => {
    const account: Account = {
      id: parseInt(id),
      saldo: parseFloat(saldo),
      ativa: status === 'ativa',
    };
    repo['accounts'].push(account);
  };
  // ==================================================================

  test('Transferência bem sucedida', ({ given, and, when, then }) => {
    given(
      /^que a conta (\d+) existe e está ativa com saldo de (.*)$/,
      (id, saldo) => setupAccount(id, saldo, 'ativa'),
    );
    and(/^a conta (\d+) existe e está ativa com saldo de (.*)$/, (id, saldo) =>
      setupAccount(id, saldo, 'ativa'),
    );
    when(
      /^eu solicito uma transferência de (.*) da conta (\d+) para a conta (\d+)$/,
      async (valor, idOrigem, idDestino) => {
        response = await request(app.getHttpServer())
          .post('/account/transfer')
          .send({
            idContaOrigem: parseInt(idOrigem),
            idContaDestino: parseInt(idDestino),
            valor: parseFloat(valor),
          });
      },
    );
    then('a operação deve ser confirmada com sucesso', () => {
      expect(response.status).toBe(201);
    });
    and(/^o saldo da conta (\d+) deve ser (.*)$/, (id, saldo) => {
      const account = repo.getAccount(parseInt(id));
      expect(account?.saldo).toBe(parseFloat(saldo));
    });
    and(/^o saldo da conta (\d+) deve ser (.*)$/, (id, saldo) => {
      const account = repo.getAccount(parseInt(id));
      expect(account?.saldo).toBe(parseFloat(saldo));
    });
  });

  test('Tentativa de transferência com valor inválido', ({
    given,
    and,
    when,
    then,
  }) => {
    given(
      /^que a conta (\d+) existe e está ativa com saldo de (.*)$/,
      (id, saldo) => setupAccount(id, saldo, 'ativa'),
    );
    and(/^a conta (\d+) existe e está ativa com saldo de (.*)$/, (id, saldo) =>
      setupAccount(id, saldo, 'ativa'),
    );
    when(
      /^eu solicito uma transferência de (.*) da conta (\d+) para a conta (\d+)$/,
      async (valor, idOrigem, idDestino) => {
        response = await request(app.getHttpServer())
          .post('/account/transfer')
          .send({
            idContaOrigem: parseInt(idOrigem),
            idContaDestino: parseInt(idDestino),
            valor: parseFloat(valor),
          });
      },
    );
    then(/^o sistema deve retornar o erro "(.*)"$/, (errorMessage) => {
      expect(response.status).toBe(400); // Bad Request
      expect(response.body.message).toBe(errorMessage);
    });
  });

  test('Contas de origem e destino iguais', ({ given, when, then }) => {
    given(
      /^que a conta (\d+) existe e está ativa com saldo de (.*)$/,
      (id, saldo) => setupAccount(id, saldo, 'ativa'),
    );
    when(
      /^eu solicito uma transferência de (.*) da conta (\d+) para a conta (\d+)$/,
      async (valor, idOrigem, idDestino) => {
        response = await request(app.getHttpServer())
          .post('/account/transfer')
          .send({
            idContaOrigem: parseInt(idOrigem),
            idContaDestino: parseInt(idDestino),
            valor: parseFloat(valor),
          });
      },
    );
    then(/^o sistema deve retornar o erro "(.*)"$/, (errorMessage) => {
      expect(response.status).toBe(400); // Bad Request
      expect(response.body.message).toBe(errorMessage);
    });
  });

  test('Tentativa de transferência envolvendo contas inativas', ({
    given,
    and,
    when,
    then,
  }) => {
    given(
      /^que a conta (\d+) está "(.*)" com saldo de (.*)$/,
      (id, status, saldo) => setupAccount(id, saldo, status),
    );
    and(/^a conta (\d+) está "(.*)" com saldo de (.*)$/, (id, status, saldo) =>
      setupAccount(id, saldo, status),
    );
    when(
      /^eu solicito uma transferência de (.*) da conta (\d+) para a conta (\d+)$/,
      async (valor, idOrigem, idDestino) => {
        response = await request(app.getHttpServer())
          .post('/account/transfer')
          .send({
            idContaOrigem: parseInt(idOrigem),
            idContaDestino: parseInt(idDestino),
            valor: parseFloat(valor),
          });
      },
    );
    then(/^o sistema deve retornar o erro "(.*)"$/, (errorMessage) => {
      expect(response.status).toBe(400); // Bad Request
      expect(response.body.message).toBe(errorMessage);
    });
  });

  test('Tentativa de transferência envolvendo contas inexistentes', ({
    given,
    and,
    when,
    then,
  }) => {
    given(/^que o estado da conta de origem (\d+) é "(.*)"$/, (id, estado) => {
      if (estado === 'existente') {
        setupAccount(id, '500');
      }
    });
    and(/^que o estado da conta de destino (\d+) é "(.*)"$/, (id, estado) => {
      if (estado === 'existente') {
        setupAccount(id, '500');
      }
    });
    when(
      /^eu solicito uma transferência de (.*) da conta (.*) para a conta (.*)$/,
      async (valor, idOrigem, idDestino) => {
        response = await request(app.getHttpServer())
          .post('/account/transfer')
          .send({
            idContaOrigem: parseInt(idOrigem),
            idContaDestino: parseInt(idDestino),
            valor: parseFloat(valor),
          });
      },
    );
    then(/^o sistema deve retornar o erro "(.*)"$/, (errorMessage) => {
      expect(response.status).toBe(404); // Not Found
      expect(response.body.message).toBe(errorMessage);
    });
  });

  test('Saldo insuficiente', ({ given, and, when, then }) => {
    given(
      /^que a conta (\d+) existe e está ativa com saldo de (.*)$/,
      (id, saldo) => setupAccount(id, saldo, 'ativa'),
    );
    and(/^a conta (\d+) existe e está ativa com saldo de (.*)$/, (id, saldo) =>
      setupAccount(id, saldo, 'ativa'),
    );
    when(
      /^eu solicito uma transferência de (.*) da conta (\d+) para a conta (\d+)$/,
      async (valor, idOrigem, idDestino) => {
        response = await request(app.getHttpServer())
          .post('/account/transfer')
          .send({
            idContaOrigem: parseInt(idOrigem),
            idContaDestino: parseInt(idDestino),
            valor: parseFloat(valor),
          });
      },
    );
    then(/^o sistema deve retornar o erro "(.*)"$/, (errorMessage) => {
      expect(response.status).toBe(405); // Method Not Allowed
      expect(response.body.message).toBe(errorMessage);
    });
  });
});
