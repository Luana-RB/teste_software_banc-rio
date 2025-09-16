import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
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
  ): Promise<boolean> {
    return this.accountService.transfer(
      transferData.idContaOrigem,
      transferData.idContaDestino,
      transferData.valor,
    );
  }
}
