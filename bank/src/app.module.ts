import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ClientModule } from './client/client.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [ClientModule, AccountModule],
  controllers: [AppController],
})
export class AppModule {}
