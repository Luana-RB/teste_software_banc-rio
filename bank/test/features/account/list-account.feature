Feature: Listar contas
  Como usuário do sistema
  Quero visualizar as contas cadastradas
  Para consultar informações de saldo e status

  Scenario: Listar todas as contas
    Given que existem contas cadastradas
    When eu solicito a listagem de contas
    Then o sistema deve retornar a lista completa de contas

  Scenario: Buscar conta por ID existente
    Given que existe uma conta com ID 1
    When eu consulto a conta pelo ID 1
    Then o sistema deve retornar os dados da conta correspondente

  Scenario: Buscar conta inexistente
    Given que não existe conta com ID 999
    When eu consulto a conta pelo ID 999
    Then o sistema deve retornar um erro "Conta #999 não encontrada"
