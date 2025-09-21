# features/client/delete-client.feature

Feature: Remoção de clientes
  Para manter a base de dados limpa e atualizada
  Como um administrador
  Eu quero remover clientes existentes e limpar a base quando necessário

  Scenario: Remover um cliente existente com sucesso
    # A preparação do cenário fica aqui dentro
    Given que o cliente com ID 1, nome "Ana", idade 25, email "ana@email.com", status "true" está cadastrado
    And o cliente com ID 1 está associado à conta com ID 101
    When uma requisição DELETE é enviada para "/client/1"
    Then o status da resposta deve ser 200
    And o cliente com ID 1 não deve mais existir no sistema
    And a conta com ID 101 também deve ser removida

  Scenario: Tentar remover um cliente inexistente
    # Este cenário começa direto na ação (When), pois não precisa de preparação
    When uma requisição DELETE é enviada para "/client/999"
    Then o status da resposta deve ser 404
    And a mensagem de erro deve ser "Cliente 999 não encontrado"

  Scenario: Remover todos os clientes
    Given que existem outros clientes cadastrados
    When uma requisição DELETE é enviada para "/client"
    Then o status da resposta deve ser 200
    And não deve haver mais nenhum cliente cadastrado no sistema