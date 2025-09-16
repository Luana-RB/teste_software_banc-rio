// Deve ser como um DB, apenas funcoes basicas

import { Injectable } from '@nestjs/common';

// Gerado com IA - Prompt: Classe base como a de clientes, {campos de contas}
@Injectable()
export class AccountRepository {
  private accounts: Account[] = [];

  public newAccount(active: boolean): Account | undefined {
    const account: Account = {
      id: this.generateId(),
      saldo: 0,
      ativa: active,
    };
    this.accounts.push(account);
    return account;
  }

  public accountExists(accountId: number): boolean {
    return this.accounts.some((account) => account.id === accountId);
  }

  public getAccount(accountId: number): Account | undefined {
    return this.accounts.find((account) => account.id === accountId);
  }

  public getAccounts({
    skip,
    take,
  }: {
    skip?: number;
    take?: number;
  }): Account[] {
    if (skip === undefined || take === undefined) {
      return this.accounts;
    }
    return this.accounts.slice(skip, skip + take);
  }

  public updateAccount(
    accountId: number,
    accountData: Account,
  ): Account | undefined {
    const existingAccount = this.getAccount(accountId);
    if (!existingAccount) {
      return undefined;
    }

    const accountIndex = this.accounts.findIndex(
      (account) => account.id === accountId,
    );
    if (accountIndex === -1) {
      return undefined;
    }
    accountData.id = accountId;
    this.accounts[accountIndex] = accountData;
    return accountData;
  }

  public deleteAccount(accountId: number): boolean {
    const accountIndex = this.accounts.findIndex(
      (account) => account.id === accountId,
    );
    if (accountIndex === -1) {
      return false;
    }
    this.accounts.splice(accountIndex, 1);
    return true;
  }

  public clear(): void {
    this.accounts = [];
  }

  public generateId(): number {
    return this.accounts.length > 0
      ? Math.max(...this.accounts.map((account) => account.id)) + 1
      : 1;
  }

}

export type Account = {
  id: number;
  saldo: number;
  ativa: boolean;
};
