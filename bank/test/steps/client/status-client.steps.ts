import { loadFeature, defineFeature } from 'jest-cucumber';
import * as path from 'path';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { ClientRepository } from '../../../src/client/entity/client.repository';
import { Client } from '../../../src/client/entity/client.repository';

const feature = loadFeature(
  path.join(__dirname, '../../features/client/status-client.feature'),
);

defineFeature(feature, (test) => {
  let app: INestApplication;
  let clientRepository: ClientRepository;
  let response: request.Response;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    clientRepository = moduleFixture.get<ClientRepository>(ClientRepository);
  });

  beforeEach(() => {
    clientRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  test('Consultar status de um cliente ativo', ({ given, when, then, and }) => {
    given(
      /^que existe um cliente com ID (.*) e seu status é "ativo"$/,
      (id: string) => {
        const client: Partial<Client> = {
          id: parseInt(id),
          active: true,
          name: 'Cliente Ativo',
        };
        clientRepository['clients'].push(client as Client);
      },
    );

    when(
      /^uma requisição GET é enviada para "\/client\/(.*)\/status"$/,
      async (id: string) => {
        response = await request(app.getHttpServer()).get(
          `/client/${id}/status`,
        );
      },
    );

    then(/^o status da resposta deve ser (\d+)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });

    and('o corpo da resposta deve ser "true"', () => {
      expect(response.body.status).toBe(true);
    });
  });

  test('Consultar status de um cliente inativo', ({
    given,
    when,
    then,
    and,
  }) => {
    given(
      /^que existe um cliente com ID (.*) e seu status é "inativo"$/,
      (id: string) => {
        const client: Partial<Client> = {
          id: parseInt(id),
          active: false,
          name: 'Cliente Inativo',
        };
        clientRepository['clients'].push(client as Client);
      },
    );

    when(
      /^uma requisição GET é enviada para "\/client\/(.*)\/status"$/,
      async (id: string) => {
        response = await request(app.getHttpServer()).get(
          `/client/${id}/status`,
        );
      },
    );

    then(/^o status da resposta deve ser (\d+)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });

    and('o corpo da resposta deve ser "false"', () => {
      expect(response.body.status).toBe(false);
    });
  });

  test('Tentar consultar status de um cliente inexistente', ({
    when,
    then,
    and,
  }) => {
    when(
      /^uma requisição GET é enviada para "\/client\/(.*)\/status"$/,
      async (id: string) => {
        response = await request(app.getHttpServer()).get(
          `/client/${id}/status`,
        );
      },
    );

    then(/^o status da resposta deve ser (\d+)$/, (status: string) => {
      expect(response.status).toBe(parseInt(status));
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (message: string) => {
      expect(response.body.message).toContain('não encontrado');
    });
  });
});
