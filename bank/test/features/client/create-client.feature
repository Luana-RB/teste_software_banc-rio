# features/client/create-client.feature

Feature: Cadastro de novos clientes
  Para gerenciar o sistema bancário
  Como um administrador
  Eu quero cadastrar clientes, garantindo que as regras de negócio sejam aplicadas

  Scenario: Criar um cliente com sucesso
    Given que os dados do novo cliente são: nome "Maria da Silva", idade 30, email "maria@email.com" e status ativo "true"
    When uma requisição POST é enviada para "/client" com esses dados
    Then o status da resposta deve ser 201
    And a resposta deve conter os dados do cliente criado com uma conta associada

  Scenario Outline: Tentar criar um cliente com idade não permitida
    Given que os dados do novo cliente são: nome "Joao", idade <idade>, email "joao@email.com" e status ativo "true"
    When uma requisição POST é enviada para "/client" com esses dados
    Then o status da resposta deve ser 400
    And a mensagem de erro deve ser "Idade não permitida: <idade>"

    Examples:
      | idade |
      | 17    | # Menor que o mínimo (18)
      | 66    | # Maior que o máximo (65)

  Scenario: Tentar criar um cliente quando o sistema de contas falha
    Given que o sistema de criação de contas está indisponível
    And os dados do novo cliente são: nome "Carlos", idade 45, email "carlos@email.com" e status ativo "true"
    When uma requisição POST é enviada para "/client" com esses dados
    Then o status da resposta deve ser 404
    And a mensagem de erro deve ser "Erro ao criar conta para o cliente"