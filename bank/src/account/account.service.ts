import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountRepository } from './entity/account.repository';
import { ClientRepository } from 'src/client/entity/client.repository';

@Injectable()
export class AccountService {

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  findAll() {
    return `This action returns all account`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  
  // Informa se uma determinada conta está ativa ou não.
  checkAccountStatus(id: number): boolean {
    const account = this.accountRepository.getAccount(id);
    
    if (!account) {
      throw new NotFoundException(`Conta #${id} não encontrada`);
    }

    return account.ativa;
  }


  // função implementada com IA
  // Transfere um determinado valor de uma conta Origem para uma conta Destino.
  async transfer(
    idContaOrigem: number,
    idContaDestino: number,
    valor: number,
  ): Promise<boolean> {
    // Validações iniciais
    if (valor <= 0) {
      throw new BadRequestException('Valor deve ser maior que zero');
    }

    const contaOrigem = this.accountRepository.getAccount(idContaOrigem);
    const contaDestino = this.accountRepository.getAccount(idContaDestino);

    // Verifica se as contas existem
    if (!contaOrigem || !contaDestino) {
      throw new NotFoundException('Conta de origem ou destino não encontrada');
    }

    // Verifica se as contas estão ativas
    if (!contaOrigem.ativa || !contaDestino.ativa) {
      throw new BadRequestException('Uma das contas está inativa');
    }

    // Verifica se há saldo suficiente
    if (contaOrigem.saldo < valor) {
      return false;
    }

    // Realiza a transferência
    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    // Atualiza as contas no repositório
    this.accountRepository.updateAccount(idContaOrigem, contaOrigem);
    this.accountRepository.updateAccount(idContaDestino, contaDestino);

    return true;
  }
}
