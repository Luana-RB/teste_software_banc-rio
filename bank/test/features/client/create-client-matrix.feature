Feature: Cadastro de clientes com combinações otimizadas (Matriz Ortogonal)
  Para garantir a robustez do sistema
  Como um testador
  Eu quero verificar as principais interações de parâmetros na criação de clientes

  Scenario Outline: Tentar criar um cliente com diferentes combinações de dados e estados do sistema
    Given o sistema está no estado "<Dependencia>" para a criação de contas
    And eu tento criar um cliente com nome "Teste Matrix", email "matrix@email.com", idade <Idade> e status <Status>
    When uma requisição POST é enviada para "/client" com esses dados
    Then o status da resposta deve ser <Status_Esperado>

    Examples:
      | Idade | Status | Dependencia       | Status_Esperado |
      | 30    | true   | "dependencia_ok"  | 201             |
      | 30    | false  | "dependencia_falha" | 201             |
      | 17    | true   | "dependencia_falha" | 400             |
      | 17    | false  | "dependencia_ok"  | 400             |
      | 66    | true   | "dependencia_ok"  | 400             |
      | 66    | false  | "dependencia_falha" | 400             |