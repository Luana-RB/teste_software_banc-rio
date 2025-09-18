import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  findAll() {
    return this.accountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Get(':id/status')
  checkAccountStatus(@Param('id') id: string) {
    return this.accountService.checkAccountStatus(+id);
  }

  @Post('transfer')
  transfer(
    @Body()
    transferData: {
      idContaOrigem: number;
      idContaDestino: number;
      valor: number;
    },
  ): boolean {
    return this.accountService.transfer(
      transferData.idContaOrigem,
      transferData.idContaDestino,
      transferData.valor,
    );
  }
}
