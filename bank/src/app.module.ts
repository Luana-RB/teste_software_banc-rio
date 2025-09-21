import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ClientModule } from './client/client.module';
import { AccountModule } from './account/account.module';
import { APP_FILTER } from '@nestjs/core'; // 1. IMPORTE O APP_FILTER
import { AgeNotPermitedExceptionFilter } from './exceptions/age-not-permited.filter'; // 2. IMPORTE SEU FILTRO

@Module({
  imports: [ClientModule, AccountModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AgeNotPermitedExceptionFilter,
    },
  ],
})
export class AppModule {}
