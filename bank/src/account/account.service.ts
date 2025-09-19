import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { AccountRepository } from '../account/entity/account.repository';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  findAll() {
    return this.accountRepository.getAccounts({});
  }

  findOne(id: number) {
    return this.accountRepository.getAccount(id);
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
  transfer(
    idContaOrigem: number,
    idContaDestino: number,
    valor: number,
  ): boolean {
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

    // Verifica se as contas são diferentes
    if (idContaOrigem === idContaDestino) {
      throw new BadRequestException(
        'Contas de origem e destino não podem ser iguais',
      );
    }

    // Verifica se há saldo suficiente
    if (contaOrigem.saldo < valor) {
      throw new MethodNotAllowedException(
        'Saldo insuficiente na conta de origem',
      );
    }

    // Realiza a transferência
    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    // Atualiza as contas no repositório
    this.accountRepository.updateAccount(idContaOrigem, contaOrigem);
    this.accountRepository.updateAccount(idContaDestino, contaDestino);

    return true;
  }

  desativaConta(id: number) {
    const conta = this.accountRepository.getAccount(id);
    if (conta) {
      conta.ativa = false;
      return true;
    }
    return false;
  }

  ativaConta(id: number) {
    const conta = this.accountRepository.getAccount(id);
    if (conta) {
      conta.ativa = true;
      return true;
    }
    return false;
  }
}
