import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { AccountService } from './account.service';
import * as accountRepository from './entity/account.repository';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  findAll(): accountRepository.Account[] {
    return this.accountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): accountRepository.Account {
    // O retorno agora é sempre Account
    const account = this.accountService.findOne(+id);
    if (!account) {
      // Lança a exceção que o NestJS converte para 404
      throw new NotFoundException(`Conta #${id} não encontrada`);
    }
    return account;
  }

  @Get(':id/status')
  checkAccountStatus(@Param('id') id: string): { status: boolean } {
    const isActive = this.accountService.checkAccountStatus(+id);
    return { status: isActive };
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

  @Patch(':id/deactivate')
  deactivateAccount(@Param('id') id: string): boolean {
    return this.accountService.desativaConta(+id);
  }

  @Patch(':id/activate')
  activateAccount(@Param('id') id: string): boolean {
    return this.accountService.ativaConta(+id);
  }
}
