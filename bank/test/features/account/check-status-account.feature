Feature: Consultar status da conta
  Como usuário do sistema
  Quero verificar se uma conta está ativa
  Para confirmar se pode ser utilizada em transações

  Scenario: Conta ativa
    Given que a conta de ID 1 está ativa
    When eu consulto o status da conta 1
    Then o sistema deve retornar "ativa"

  Scenario: Conta inativa
    Given que a conta de ID 2 está inativa
    When eu consulto o status da conta 2
    Then o sistema deve retornar "inativa"

  Scenario: Conta inexistente
    Given que não existe conta com ID 999
    When eu consulto o status da conta 999
    Then o sistema deve retornar um erro "Conta #999 não encontrada"