Feature: Alterar status da conta
  Como usuário do sistema
  Quero ativar ou desativar contas
  Para controlar o seu uso em transações bancárias

  Scenario: Desativar uma conta ativa
    Given que a conta de ID 1 existe e está ativa
    When eu solicito a desativação da conta 1
    Then a operação deve retornar "sucesso"
    And o status da conta 1 deve ser "inativo"

  Scenario: Ativar uma conta inativa
    Given que a conta de ID 2 existe e está inativa
    When eu solicito a ativação da conta 2
    Then a operação deve retornar "sucesso"
    And o status da conta 2 deve ser "ativo"

  Scenario: Tentar desativar uma conta inexistente
    Given que a conta de ID 999 não existe
    When eu solicito a desativação da conta 999
    Then a operação deve retornar "falha"

  Scenario: Tentar ativar uma conta inexistente
    Given que a conta de ID 999 não existe
    When eu solicito a ativação da conta 999
    Then a operação deve retornar "falha"