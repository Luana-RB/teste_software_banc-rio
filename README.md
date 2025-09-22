# Teste de Software Sistema Bancário

Este projeto consiste em uma API REST para uma aplicação bancária simples, com o objetivo de estudar de forma prática a aplicação de diversas técnicas avançadas de teste de software, desde a caixa-branca até a caixa-cinza.

## Alunos:

- Arthur Azevedo da Silva
- Luana Reginato Bassanesi
- Saymon Roger Rasador

## Visão geral do projeto:

A aplicação simula funcionalidades básicas de um banco, gerenciando clientes e suas contas correntes através de "Gerenciadores" que atuam como repositórios em memória.

## Funcionalidades Implementadas

- Gerenciamento de Clientes: Adicionar, remover, listar e verificar o status de clientes.
- Gerenciamento de Contas: Adicionar, remover e listar contas.
- Operações Financeiras: Realizar transferências de valores entre contas.
- Nova Funcionalidade - Ciclo de Vida da Conta: Foi implementado um sistema de ativação e desativação de contas. Uma conta pode ser desativada (por exemplo, ao ter seu saldo zerado) e reativada ao receber uma transferência.
- Nova Funcionalidade - Consulta de Cliente e Conta: Foi implementada uma funcionalidade que permite consultar os clientes e suas contas associadas, retornando um objeto para cada cliente com as informações do cliente e uma lista de suas contas.

## Tecnologias utilizadas no Projeto:

- **NestJS & TypeScript**: Para a construção da API.
- **Jest**: Framework principal para execução de testes unitários e de caixa-cinza.
- **Supertest**: Para realizar requisições HTTP à API durante os testes.
- **Jest-Cucumber**: Para integrar os testes BDD (Gherkin) ao Jest.

# Testes

## Tecnologias usadas para os testes:

- NodeJS
- Insomnia
- Jest
- Gherkin + Cucumber

## Técnicas de Teste de software

- Teste de Fluxo de Controle
- Teste de ramificação
- Particionamento de Equivalência
- Teste de transição de estado
- Teste de matriz
- Teste Ortogonal

## CAIXA BRANCA

### Teste de Fluxo de Controle

Definição: Garante que todos os caminhos de execução do código-fonte sejam percorridos ao menos uma vez.

- pnpm run test:cov: gera um relatório que demonstra que as linhas, funções e caminhos do código foram executados pelos testes unitários

### Teste de Ramificação

Definição: Foca em garantir que cada "ramo" de uma decisão condicional (if, else, switch) seja testado, validando tanto o resultado verdadeiro quanto o falso.

A função checkAccountStatus no Account.service.specs é um exemplo claro. Nós garantimos a cobertura de todos os seus ramos lógicos:

```typescript
// Teste para o ramo 1: Conta ativa
it("should return true if account is active", () => {
  mockAccountRepository.getAccount.mockReturnValue({ id: 1, ativa: true });
  expect(service.checkAccountStatus(1)).toBe(true);
});

// Teste para o ramo 2: Conta inativa
it("should return false if account is inactive", () => {
  mockAccountRepository.getAccount.mockReturnValue({ id: 1, ativa: false });
  expect(service.checkAccountStatus(1)).toBe(false);
});

// Teste para o ramo 3: Conta não encontrada (exceção)
it("should throw NotFoundException if account does not exist", () => {
  mockAccountRepository.getAccount.mockReturnValue(null);
  expect(() => service.checkAccountStatus(1)).toThrow(NotFoundException);
});
```

## CAIXA PRETA

### Particionamento de Equivalencia

Definição: Divide os possíveis valores de entrada de uma funcionalidade em grupos (ou "partições") de dados que se espera que o sistema trate de maneira semelhante.

Esta técnica foi usada extensivamente:

- Validação de Idade (Client.service.specs):
  - Partição 1 (inválida, menor): 17
  - Partição 2 (válida): 30
  - Partição 3 (inválida, maior): 66
- Valor da Transferência (Account.service.specs):
  - Partição 1 (válida): valor > 0
  - Partição 2 (inválida): valor <= 0

### Transição de Estado

Definição: Valida as mudanças de estado de um objeto em resposta a eventos ou operações.

A nova funcionalidade de ativar/desativar conta foi testada usando esta técnica no Account.service.specs. O ciclo de vida da conta foi validado:

- Estado Inicial: Ativa
- Evento: service.deactivateAccount(1)
- Estado Intermediário: Inativa (verificado)
- Evento: service.activateAccount(1)
- Estado Final: Ativa (verificado)

## CAIXA CINZA

### Teste de Matriz

Definição: Organiza múltiplas condições de negócio em uma tabela para derivar casos de teste que cobrem as combinações mais importantes.
Usamos a abordagem de Scenario Outline no Gherkin para testar a funcionalidade de consulta de status do cliente, representando a seguinte matriz de decisão:

### Teste de Matriz Ortogonal

Definição: Uma técnica avançada para testar de forma eficiente as interações entre múltiplos parâmetros, garantindo que cada par de valores seja testado pelo menos uma vez com um número mínimo de testes.

Foi aplicado na funcionalidade de criação de cliente (create-client-matrix.feature). Em vez de testar todas as 12 combinações possíveis, otimizamos para 6 testes que cobrem todas as interações de pares entre os seguintes parâmetros:

- Idade: inválida_menor, válida, inválida_maior
- Status Inicial: ativo, inativo
- Dependência do Sistema de Contas: ok, falha
