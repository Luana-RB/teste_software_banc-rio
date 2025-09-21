Feature: Transferência entre contas
  Como usuário do sistema
  Quero transferir valores entre contas
  Para movimentar o saldo de forma segura

  Scenario: Transferência bem sucedida
    Given que a conta 1 existe e está ativa com saldo de 500.00
    And a conta 2 existe e está ativa com saldo de 100.00
    When eu solicito uma transferência de 200.00 da conta 1 para a conta 2
    Then a operação deve ser confirmada com sucesso
    And o saldo da conta 1 deve ser 300.00
    And o saldo da conta 2 deve ser 300.00

  Scenario Outline: Tentativa de transferência com valor inválido
    Given que a conta 1 existe e está ativa com saldo de 500.00
    And a conta 2 existe e está ativa com saldo de 100.00
    When eu solicito uma transferência de <Valor> da conta 1 para a conta 2
    Then o sistema deve retornar o erro "Valor deve ser maior que zero"

    Examples:
      | Valor |
      | -50   |
      | 0     |

  Scenario: Contas de origem e destino iguais
    Given que a conta 1 existe e está ativa com saldo de 500.00
    When eu solicito uma transferência de 100.00 da conta 1 para a conta 1
    Then o sistema deve retornar o erro "Contas de origem e destino não podem ser iguais"

  Scenario Outline: Tentativa de transferência envolvendo contas inativas
    Given que a conta 1 está <StatusOrigem> com saldo de 200.00
    And a conta 2 está <StatusDestino> com saldo de 100.00
    When eu solicito uma transferência de 50.00 da conta 1 para a conta 2
    Then o sistema deve retornar o erro "Uma das contas está inativa"

    Examples:
      | StatusOrigem | StatusDestino |
      | "inativa"    | "ativa"       |
      | "ativa"      | "inativa"     |

  Scenario Outline: Tentativa de transferência envolvendo contas inexistentes
    Given que o estado da conta de origem <IdOrigem> é <EstadoOrigem>
    And que o estado da conta de destino <IdDestino> é <EstadoDestino>
    When eu solicito uma transferência de 100.00 da conta <IdOrigem> para a conta <IdDestino>
    Then o sistema deve retornar o erro "Conta de origem ou destino não encontrada"

    Examples:
      | IdOrigem | EstadoOrigem  | IdDestino | EstadoDestino |
      | 999      | "inexistente" | 2         | "existente"   |
      | 1        | "existente"   | 999       | "inexistente" |

  Scenario: Saldo insuficiente
    Given que a conta 1 existe e está ativa com saldo de 50.00
    And a conta 2 existe e está ativa com saldo de 200.00
    When eu solicito uma transferência de 100.00 da conta 1 para a conta 2
    Then o sistema deve retornar o erro "Saldo insuficiente na conta de origem"