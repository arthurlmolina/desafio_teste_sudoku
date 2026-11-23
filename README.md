# desafio_teste_sudoku

Desafio: **Sudoku Binário 6 x 6**. Implementação e casos de teste automatizados escritos em **JavaScript** para testar **JavaScript** usando o executor nativo `node:test`.

## Especificação

- **Grade:** Matriz **6 x 6** preenchida com `0`, `1` ou `.` (célula vazia / `null`).
- **Regras do jogo:**
  1. No máximo **dois** valores iguais consecutivos em qualquer linha ou coluna.
  2. Cada linha e cada coluna deve conter exatamente **três `0` e três `1`**.
  3. **Não podem existir duas linhas** completas idênticas nem **duas colunas** completas idênticas.
- **Componentes:** Funções `parse`, `validate`, `isComplete`, `isSolved`, `solve` (resolvedor por backtracking) e a classe `BinarySudoku` (protege células fixas iniciais).

## Como rodar

```bash
npm install
npm test            # executa os 24 casos de teste
npm run coverage    # executa os testes com relatório de cobertura (100% em linhas, branches e funções do código-fonte)
```

Estrutura do repositório: `src/binarySudoku.js` (implementação) e `tests/binarySudoku.test.js` (suíte de testes).

## Funcionamento dos casos de teste

A suíte contém **24 testes automatizados** executados com `node:test` e asserções locais. Os CT01–CT21 cobrem parser, regras do Sudoku binário, resolvedor por backtracking e interação pela classe `BinarySudoku`; os CT22–CT24 verificam grades malformadas, métodos da classe e um puzzle válido sem solução para exercitar o retrocesso.

### Especificação Detalhada dos Casos de Teste

---

#### Caso de Teste 1 — Parser e Validação de Entrada (`CT01` e `CT02`)
- **Descrição:** Verificar se a função `parse` converte corretamente strings 6x6 em matriz numérica (`0`, `1`, `null`) e rejeita dimensões ou caracteres inválidos.
- **Pré-condições:** Funções exportadas de `src/binarySudoku.js` carregadas.
- **Passos:**
  1. Passar um array de 6 strings de comprimento 6 contendo `'0'`, `'1'` e `'.'` para `parse()`.
  2. Passar arrays com menos de 6 linhas, linhas com tamanho diferente de 6 e caracteres não permitidos (ex.: `'x'`).
- **Cenários:**
  - **CT01 — Conversão válida 6x6:** Dados: `['01....', ..., '.....1']` | Resultado Esperado: `g[0].slice(0,3)` igual a `[0, 1, null]` e `g[5][5] === 1`.
  - **CT02 — Rejeição de formato inválido:** Dados: `['010']`, linha com 5 chars e `'01010x'` | Resultado Esperado: lança `Error` (`'inválido'` para caractere incorreto).

---

#### Caso de Teste 2 — Regras de Validação do Sudoku Binário (`CT03` a `CT13`)
- **Descrição:** Validar todas as regras de consistência do tabuleiro: solução completa, tabuleiro vazio, triplas consecutivas, excesso de dígitos e linhas/colunas duplicadas.
- **Pré-condições:** Matrizes 6x6 geradas via `parse`.
- **Passos:**
  1. Validar uma solução 6x6 válida completa (`SOLUTION`) e um tabuleiro vazio (`......`).
  2. Inserir três `'1'` seguidos na linha 0 e três `'0'` seguidos na coluna 0 e chamar `validate()`.
  3. Testar pares consecutivos (`'0011..'`) e linhas/colunas com 4 dígitos iguais sem triplas (`'110110'`).
  4. Duplicar linhas completas e colunas completas, além de testar linhas parciais idênticas (`'01....'`).
  5. Alterar um dígito de uma solução completa gerando grade cheia porém inválida.
- **Cenários:**
  - **CT03 — Solução válida completa:** Dados: `SOLUTION` | Resultado Esperado: `validate(g).valid === true` e `isSolved(g) === true`.
  - **CT04 — Tabuleiro vazio:** Dados: 6 linhas `'......'` | Resultado Esperado: `valid === true`, `isComplete === false` e `isSolved === false`.
  - **CT05 — Tripla na linha:** Dados: linha 0 `'111...'` | Resultado Esperado: erro `{ type: 'tres_iguais', kind: 'linha', index: 0 }`.
  - **CT06 — Tripla na coluna:** Dados: `'0'` nas linhas 0, 1 e 2 da coluna 0 | Resultado Esperado: erro `{ type: 'tres_iguais', kind: 'coluna', index: 0 }`.
  - **CT07 — Duplas consecutivas permitidas:** Dados: linha 0 `'0011..'` | Resultado Esperado: `validate(g).valid === true`.
  - **CT08 — Excesso de `1`s na linha:** Dados: linha 0 `'110110'` (quatro `1`s) | Resultado Esperado: erro `{ type: 'excesso', kind: 'linha', index: 0 }`.
  - **CT09 — Excesso de `0`s na coluna:** Dados: quatro `'0'` na coluna 0 | Resultado Esperado: erro `{ type: 'excesso', kind: 'coluna', index: 0 }`.
  - **CT10 — Linhas completas idênticas:** Dados: linhas 0 e 1 iguais a `'010110'` | Resultado Esperado: erro `{ type: 'iguais', kind: 'linha', index: [0, 1] }`.
  - **CT11 — Colunas completas idênticas:** Dados: colunas 0 e 1 iguais a `'010101'` | Resultado Esperado: erro `{ type: 'iguais', kind: 'coluna', index: [0, 1] }`.
  - **CT12 — Linhas incompletas iguais:** Dados: linhas 0 e 1 `'01....'` | Resultado Esperado: nenhum erro do tipo `'iguais'`.
  - **CT13 — Grade cheia porém inválida:** Dados: `SOLUTION` com `g[0][0] = 1` | Resultado Esperado: `isComplete === true` e `isSolved === false`.

---

#### Caso de Teste 3 — Resolvedor por Backtracking (`CT14` a `CT17`)
- **Descrição:** Verificar se `solve(grid)` encontra soluções válidas respeitando pistas fixas, retorna `null` para tabuleiros impossíveis e não muta a entrada.
- **Pré-condições:** Puzzles válidos e inválidos preparados via `parse`.
- **Passos:**
  1. Executar `solve()` em um puzzle parcialmente preenchido e verificar se as pistas originais foram preservadas.
  2. Executar `solve()` em um tabuleiro totalmente vazio.
  3. Executar `solve()` em um tabuleiro com violação inicial (`'111...'`).
  4. Verificar se a matriz original passada ao `solve()` permanece inalterada.
- **Cenários:**
  - **CT14 — Puzzle com pistas:** Dados: `['0.0.1.', '.1..0.', '1.0..0', '..1.0.', '0.0.0.', '.0.0.0']` | Resultado Esperado: solução não-nula com `isSolved(sol) === true` e pistas intactas.
  - **CT15 — Tabuleiro vazio:** Dados: 6 linhas `'......'` | Resultado Esperado: `isSolved(solve(g)) === true`.
  - **CT16 — Puzzle sem solução:** Dados: linha 0 `'111...'` | Resultado Esperado: retorna `null`.
  - **CT17 — Imutabilidade da entrada:** Dados: puzzle com `puzzle[0][1] === null` | Resultado Esperado: `puzzle[0][1]` continua `null` após `solve(puzzle)`.

---

#### Caso de Teste 4 — Classe `BinarySudoku` e Jogabilidade (`CT18` a `CT21`)
- **Descrição:** Validar a proteção de células iniciais fixas, escrita/limpeza de células editáveis, validação de domínio e detecção de vitória.
- **Pré-condições:** Instância de `BinarySudoku` inicializada.
- **Passos:**
  1. Instanciar `BinarySudoku` com célula `(0, 0)` preenchida e tentar sobrescrevê-la com `set(0, 0, 1)`.
  2. Em grade vazia, preencher `(0, 0)` com `1`, limpar com `null` e testar valor inválido (`2`) e índice fora da grade (`6, 0`).
  3. Preencher a última célula faltante de um puzzle quase completo e consultar `isSolved()`.
  4. Tentar instanciar `new BinarySudoku([[0, 1], [1, 0]])`.
- **Cenários:**
  - **CT18 — Proteção de célula fixa:** Dados: `s.set(0, 0, 1)` em pista inicial | Resultado Esperado: lança erro contendo `'fixa'`.
  - **CT19 — Edição, limpeza e validações:** Dados: `set(0,0,1)`, `set(0,0,null)`, `set(0,0,2)`, `set(6,0,1)` | Resultado Esperado: grava `1`, limpa para `null`, lança `Error` para valor `2` e `RangeError` para índice `6`.
  - **CT20 — Conclusão da partida:** Dados: puzzle faltando apenas `(5, 5)`, ação `s.set(5, 5, 0)` | Resultado Esperado: `isSolved()` muda de `false` para `true`.
  - **CT21 — Dimensão inválida no construtor:** Dados: matriz `2x2` | Resultado Esperado: lança erro contendo `'6x6'`.

## Execução e cobertura de código

Os testes usam o executor nativo `node:test`, incluído no Node.js, sem dependências externas. Execute `npm test` para rodar a suíte e `npm run coverage` para medir o código-fonte em `src/`. O comando de cobertura exige 100% de linhas, decisões (branches) e funções; se algum desses limites não for atingido, o comando termina com falha. Os arquivos auxiliares de teste não entram no cálculo, pois a métrica solicitada é a cobertura da implementação do desafio.

A suíte contém **24 testes automatizados**. Além dos cenários CT numerados, foram acrescentadas verificações de entradas inválidas, limites e fluxos alternativos.

### Testes complementares de robustez

Além dos cenários detalhados acima, foram adicionados: CT22–CT24: linhas e grades malformadas, validação dos métodos da classe e puzzle inicialmente válido sem solução, exercitando o retrocesso do resolvedor.

A cobertura é calculada somente sobre os arquivos de implementação em `src/`, não sobre o próprio código auxiliar usado pelos testes. O comando de cobertura exige simultaneamente **100% de linhas, 100% de branches e 100% de funções**; qualquer percentual abaixo disso faz o comando falhar.

## Colaboradores

| Nome | RA |
|---|---|
| Arthur Lavagnolli Molina | 24031565-2 |
| Gustavo dos Santos Guimarães | 24000191-2 |
