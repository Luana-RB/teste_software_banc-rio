import { loadFeature, defineFeature } from 'jest-cucumber';
import * as path from 'path';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { AccountRepository } from '../../../src/account/entity/account.repository';
import { CreateClientDto } from '../../../src/client/dto/create-client.dto';

const feature = loadFeature(
  path.join(__dirname, '../../features/client/create-client-matrix.feature'),
);

defineFeature(feature, (test) => {
  let app: INestApplication;
  let accountRepository: AccountRepository;
  let response: request.Response;
  let requestBody: CreateClientDto;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    accountRepository = moduleFixture.get<AccountRepository>(AccountRepository);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    accountRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  test('Tentar criar um cliente com diferentes combinações de dados e estados do sistema', ({
    given,
    and,
    when,
    then,
  }) => {
    given(
      /^o sistema está no estado "(.*)" para a criação de contas$/,
      (dependencia: string) => {
        if (dependencia === 'dependencia_falha') {
          jest.spyOn(accountRepository, 'newAccount').mockImplementation(() => {
            return undefined;
          });
        }
      },
    );

    and(
      /^eu tento criar um cliente com nome "(.*)", email "(.*)", idade (.*) e status (.*)$/,
      (name: string, email: string, age: string, active: string) => {
        requestBody = {
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
          .send(requestBody);
      },
    );

    then(/^o status da resposta deve ser (.*)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });
  });
});
