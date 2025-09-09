import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AccountRepository } from './entity/account.repository';
import { ClientRepository } from 'src/client/entity/client.repository';

@Module({
  controllers: [AccountController],
  providers: [AccountService, AccountRepository, ClientRepository],
})
export class AccountModule {}
