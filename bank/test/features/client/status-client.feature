# features/client/status-client.feature

Feature: Verificação de status do cliente
  Para saber a situação de um cliente no sistema
  Como um administrador
  Eu quero consultar se um cliente está ativo ou inativo

  Scenario: Consultar status de um cliente ativo
    Given que existe um cliente com ID 1 e seu status é "ativo"
    When uma requisição GET é enviada para "/client/1/status"
    Then o status da resposta deve ser 200
    And o corpo da resposta deve ser "true"

  Scenario: Consultar status de um cliente inativo
    Given que existe um cliente com ID 2 e seu status é "inativo"
    When uma requisição GET é enviada para "/client/2/status"
    Then o status da resposta deve ser 200
    And o corpo da resposta deve ser "false"

   Scenario: Tentar consultar status de um cliente inexistente
    When uma requisição GET é enviada para "/client/999/status"
    Then o status da resposta deve ser 404
    And a mensagem de erro deve ser "Cliente 999 não encontrado"