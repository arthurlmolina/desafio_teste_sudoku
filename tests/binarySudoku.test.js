require('./test-helpers');
const { parse, validate, isSolved, isComplete, solve, BinarySudoku } = require('../src');

const SOLUTION = ['010110', '011001', '100110', '101001', '010101', '101010'];

describe('Parser', () => {
  test('CT01 - converte texto em matriz 6x6', () => {
    const g = parse(['01....', '......', '......', '......', '......', '.....1']);
    expect(g[0].slice(0, 3)).toEqual([0, 1, null]);
    expect(g[5][5]).toBe(1);
  });
  test('CT02 - rejeita tamanho ou caractere inválido', () => {
    expect(() => parse(['010'])).toThrow();
    expect(() => parse(['01010', ...SOLUTION.slice(1)])).toThrow();
    expect(() => parse(['01010x', ...SOLUTION.slice(1)])).toThrow('inválido');
  });
});

describe('Regras do Sudoku binário', () => {
  test('CT03 - solução correta é válida e resolvida', () => {
    const g = parse(SOLUTION);
    expect(validate(g).valid).toBe(true);
    expect(isSolved(g)).toBe(true);
  });
  test('CT04 - tabuleiro vazio é válido mas não está completo', () => {
    const g = parse(Array(6).fill('......'));
    expect(validate(g).valid).toBe(true);
    expect(isComplete(g)).toBe(false);
    expect(isSolved(g)).toBe(false);
  });
  test('CT05 - detecta três iguais seguidos na linha', () => {
    const g = parse(['111...', ...Array(5).fill('......')]);
    expect(validate(g).errors).toContainEqual({ type: 'tres_iguais', kind: 'linha', index: 0 });
  });
  test('CT06 - detecta três iguais seguidos na coluna', () => {
    const g = parse(['0.....', '0.....', '0.....', '......', '......', '......']);
    expect(validate(g).errors).toContainEqual({ type: 'tres_iguais', kind: 'coluna', index: 0 });
  });
  test('CT07 - dois iguais seguidos são permitidos', () => {
    expect(validate(parse(['0011..', ...Array(5).fill('......')])).valid).toBe(true);
  });
  test('CT08 - detecta excesso de 1s na linha mesmo sem triplas', () => {
    const g = parse(['110110', ...Array(5).fill('......')]);
    expect(validate(g).errors).toContainEqual({ type: 'excesso', kind: 'linha', index: 0 });
  });
  test('CT09 - detecta excesso de 0s na coluna', () => {
    const g = parse(['0.....', '0.....', '1.....', '0.....', '0.....', '......']);
    expect(validate(g).errors).toContainEqual({ type: 'excesso', kind: 'coluna', index: 0 });
  });
  test('CT10 - detecta linhas completas idênticas', () => {
    const g = parse(['010110', '010110', ...Array(4).fill('......')]);
    expect(validate(g).errors).toContainEqual({ type: 'iguais', kind: 'linha', index: [0, 1] });
  });
  test('CT11 - detecta colunas completas idênticas', () => {
    const g = parse(['00....', '11....', '00....', '11....', '00....', '11....']);
    expect(validate(g).errors).toContainEqual({ type: 'iguais', kind: 'coluna', index: [0, 1] });
  });
  test('CT12 - linhas parcialmente preenchidas não contam como idênticas', () => {
    const g = parse(['01....', '01....', ...Array(4).fill('......')]);
    expect(validate(g).errors.filter((e) => e.type === 'iguais')).toHaveLength(0);
  });
  test('CT13 - grade completa mas inválida não está resolvida', () => {
    const g = parse(SOLUTION);
    g[0][0] = 1;
    expect(isComplete(g)).toBe(true);
    expect(isSolved(g)).toBe(false);
  });
});

describe('Solver', () => {
  test('CT14 - resolve puzzle com células removidas e respeita as dicas', () => {
    const puzzle = parse(['0.0.1.', '.1..0.', '1.0..0', '..1.0.', '0.0.0.', '.0.0.0']);
    const sol = solve(puzzle);
    expect(sol).not.toBeNull();
    expect(isSolved(sol)).toBe(true);
    puzzle.forEach((row, r) => row.forEach((v, c) => { if (v !== null) expect(sol[r][c]).toBe(v); }));
  });
  test('CT15 - tabuleiro vazio tem solução', () => {
    expect(isSolved(solve(parse(Array(6).fill('......'))))).toBe(true);
  });
  test('CT16 - puzzle impossível retorna null', () => {
    expect(solve(parse(['111...', ...Array(5).fill('......')]))).toBeNull();
  });
  test('CT17 - solver não altera o tabuleiro original', () => {
    const puzzle = parse(['0.....', ...Array(5).fill('......')]);
    solve(puzzle);
    expect(puzzle[0][1]).toBeNull();
  });
});

describe('Classe BinarySudoku', () => {
  test('CT18 - não permite alterar células fixas', () => {
    const s = new BinarySudoku(['0.....', ...Array(5).fill('......')]);
    expect(() => s.set(0, 0, 1)).toThrow('fixa');
  });
  test('CT19 - permite preencher, limpar e valida valores', () => {
    const s = new BinarySudoku(Array(6).fill('......'));
    s.set(0, 0, 1);
    expect(s.grid[0][0]).toBe(1);
    s.set(0, 0, null);
    expect(s.grid[0][0]).toBeNull();
    expect(() => s.set(0, 0, 2)).toThrow();
    expect(() => s.set(6, 0, 1)).toThrow(RangeError);
  });
  test('CT20 - jogador completa o puzzle e vence', () => {
    const s = new BinarySudoku(['010110', '011001', '100110', '101001', '010101', '10101.']);
    expect(s.isSolved()).toBe(false);
    s.set(5, 5, 0);
    expect(s.isSolved()).toBe(true);
  });
  test('CT21 - rejeita tabuleiro que não é 6x6', () => {
    expect(() => new BinarySudoku([[0, 1], [1, 0]])).toThrow('6x6');
  });
});


describe('Validações adicionais e métodos da classe', () => {
  test('CT22 - rejeita linhas que não são texto e grades malformadas', () => {
    expect(() => parse([1, '......', '......', '......', '......', '......'])).toThrow(TypeError);
    expect(validate([[0, 1]])).toEqual({ valid: false, errors: [{ type: 'estrutura', kind: 'tabuleiro' }] });
    expect(validate(Array.from({ length: 6 }, () => Array(6).fill(2))).valid).toBe(false);
    expect(() => new BinarySudoku(null)).toThrow(TypeError);
  });
  test('CT23 - métodos validate e solve da instância funcionam', () => {
    const s = new BinarySudoku(['010110', '011001', '100110', '101001', '010101', '10101.']);
    expect(s.validate().valid).toBe(true);
    expect(isSolved(s.solve())).toBe(true);
  });
  test('CT24 - solver retrocede quando um puzzle válido não possui solução', () => {
    const puzzle = [[null,1,1,0,null,1],[1,0,null,null,null,0],[null,0,1,null,null,null],[0,null,null,null,null,0],[0,null,null,null,1,null],[1,0,1,null,null,1]];
    expect(validate(puzzle).valid).toBe(true);
    expect(solve(puzzle)).toBeNull();
  });
});
