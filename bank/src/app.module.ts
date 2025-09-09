import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [AccountModule, ClientModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
