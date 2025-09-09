import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { ClientRepository } from './entity/client.repository';
import { AccountRepository } from 'src/account/entity/account.repository';

@Module({
  controllers: [ClientController],
  providers: [ClientService, ClientRepository, AccountRepository],
})
export class ClientModule {}
