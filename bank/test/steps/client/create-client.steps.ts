// test/steps/client/create-client.steps.ts

import { loadFeature, defineFeature } from 'jest-cucumber';
import * as path from 'path';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { ClientRepository } from '../../../src/client/entity/client.repository';
import { AccountRepository } from '../../../src/account/entity/account.repository';
import { CreateClientDto } from '../../../src/client/dto/create-client.dto';

const feature = loadFeature(
  path.join(__dirname, '../../features/client/create-client.feature'),
);

defineFeature(feature, (test) => {
  let app: INestApplication;
  let clientRepository: ClientRepository;
  let accountRepository: AccountRepository;
  let response: request.Response;
  let createClientDto: CreateClientDto;
  let mockNewAccount: jest.SpyInstance;

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
    if (mockNewAccount) {
      mockNewAccount.mockRestore(); // Restaura qualquer mock antes de cada teste
    }
  });

  afterAll(async () => {
    await app.close();
  });

  test('Criar um cliente com sucesso', ({ given, when, then, and }) => {
    given(
      /^que os dados do novo cliente são: nome "(.*)", idade (\d+), email "(.*)" e status ativo "(.*)"$/,
      (name: string, age: string, email: string, active: string) => {
        createClientDto = {
          name,
          age: parseInt(age),
          email,
          active: active === 'true',
          idAccount: 0,
        };
      },
    );

    when(
      'uma requisição POST é enviada para "/client" com esses dados',
      async () => {
        response = await request(app.getHttpServer())
          .post('/client')
          .send(createClientDto);
      },
    );

    then(/^o status da resposta deve ser (\d+)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });

    and(
      'a resposta deve conter os dados do cliente criado com uma conta associada',
      () => {
        expect(response.body.id).toBeDefined();
        expect(response.body.name).toBe(createClientDto.name);
        expect(response.body.idAccount).toBeDefined();
      },
    );
  });

  test('Tentar criar um cliente com idade não permitida', ({
    given,
    when,
    then,
    and,
  }) => {
    given(
      /^que os dados do novo cliente são: nome "(.*)", idade (.*), email "(.*)" e status ativo "(.*)"$/,
      (name: string, age: string, email: string, active: string) => {
        createClientDto = {
          name,
          age: parseInt(age),
          email,
          active: active === 'true',
          idAccount: 0,
        };
      },
    );

    when(
      'uma requisição POST é enviada para "/client" com esses dados',
      async () => {
        response = await request(app.getHttpServer())
          .post('/client')
          .send(createClientDto);
      },
    );

    then(/^o status da resposta deve ser (\d+)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (message: string) => {
      expect(response.body.message).toContain(message);
    });
  });

  test('Tentar criar um cliente quando o sistema de contas falha', ({
    given,
    and,
    when,
    then,
  }) => {
    given('que o sistema de criação de contas está indisponível', () => {
      mockNewAccount = jest
        .spyOn(accountRepository, 'newAccount')
        .mockReturnValue(undefined);
    });

    and(
      /^os dados do novo cliente são: nome "(.*)", idade (\d+), email "(.*)" e status ativo "(.*)"$/,
      (name: string, age: string, email: string, active: string) => {
        createClientDto = {
          name,
          age: parseInt(age),
          email,
          active: active === 'true',
          idAccount: 0,
        };
      },
    );

    when(
      'uma requisição POST é enviada para "/client" com esses dados',
      async () => {
        response = await request(app.getHttpServer())
          .post('/client')
          .send(createClientDto);
      },
    );

    then(/^o status da resposta deve ser (\d+)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (message: string) => {
      expect(response.body.message).toBe(message);
    });
  });
});
