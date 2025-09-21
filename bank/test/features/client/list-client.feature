# features/client/list-client.feature (renomeado de get-client.feature)

Feature: Consulta e listagem de clientes
  Para visualizar e gerenciar informações
  Como um administrador
  Eu quero buscar clientes por ID e listar todos os clientes cadastrados

  Scenario: Consultar um cliente existente por ID
    # A preparação do cenário fica aqui
    Given que o cliente com ID 1, nome "Carlos", idade 40, email "carlos@email.com", está cadastrado e associado à conta com ID 101
    When uma requisição GET é enviada para "/client/1"
    Then o status da resposta deve ser 200
    And a resposta deve conter os dados do cliente com ID 1

  Scenario: Tentar consultar um cliente inexistente por ID
    When uma requisição GET é enviada para "/client/999"
    Then o status da resposta deve ser 404
    And a mensagem de erro deve ser "Cliente não encontrado"

  Scenario: Listar todos os clientes cadastrados
    # A preparação também fica aqui
    Given que o cliente com ID 1, nome "Carlos", idade 40, email "carlos@email.com", está cadastrado e associado à conta com ID 101
    And o cliente com ID 2, nome "Beatriz", idade 22, email "bia@email.com", está cadastrado e associado à conta com ID 102
    When uma requisição GET é enviada para "/client"
    Then o status da resposta deve ser 200
    And a resposta deve ser uma lista contendo 2 clientes

  Scenario: Listar clientes com os dados completos das contas
  Given que já existem clientes vinculados a contas
  When uma requisição GET é enviada para "/client/list/complete"
  Then o status da resposta deve ser 200
  And a resposta deve ser uma lista de clientes, onde cada cliente possui os dados de sua conta aninhados

  Scenario: Listar clientes quando não há nenhum cadastrado
    # Este cenário tem sua própria preparação, que é garantir que o sistema está vazio
    Given que não há clientes cadastrados no sistema
    When uma requisição GET é enviada para "/client"
    Then o status da resposta deve ser 200
    And a resposta deve ser uma lista vazia