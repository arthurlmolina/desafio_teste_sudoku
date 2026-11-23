const SIZE = 6;

/** Converte ['0.1...', ...] em matriz 6x6 com null nas vazias. */
function parse(lines) {
  if (!Array.isArray(lines) || lines.length !== SIZE) throw new Error('Tabuleiro deve ter 6 linhas');
  return lines.map((l) => {
    if (typeof l !== 'string') throw new TypeError('Cada linha deve ser uma string');
    if (l.length !== SIZE) throw new Error('Cada linha deve ter 6 colunas');
    return [...l].map((ch) => {
      if (ch === '0') return 0;
      if (ch === '1') return 1;
      if (ch === '.') return null;
      throw new Error('Caractere inválido: ' + ch);
    });
  });
}

const transpose = (g) => g[0].map((_, c) => g.map((row) => row[c]));
const clone = (g) => g.map((r) => r.slice());

function lineErrors(line, kind, index) {
  const errors = [];
  for (let i = 0; i + 2 < SIZE; i++) {
    if (line[i] !== null && line[i] === line[i + 1] && line[i] === line[i + 2]) {
      errors.push({ type: 'tres_iguais', kind, index });
      break;
    }
  }
  const zeros = line.filter((v) => v === 0).length;
  const ones = line.filter((v) => v === 1).length;
  if (zeros > SIZE / 2 || ones > SIZE / 2) errors.push({ type: 'excesso', kind, index });
  return errors;
}

function duplicateErrors(lines, kind) {
  const errors = [];
  for (let i = 0; i < SIZE; i++) {
    if (lines[i].includes(null)) continue;
    for (let j = i + 1; j < SIZE; j++) {
      if (!lines[j].includes(null) && lines[i].join('') === lines[j].join('')) {
        errors.push({ type: 'iguais', kind, index: [i, j] });
      }
    }
  }
  return errors;
}

/** Regras: no máx. 2 iguais seguidos; 3 zeros e 3 uns por linha/coluna; sem linhas/colunas idênticas. */
function validate(grid) {
  if (!Array.isArray(grid) || grid.length !== SIZE || grid.some((row) => !Array.isArray(row) || row.length !== SIZE || row.some((v) => v !== 0 && v !== 1 && v !== null))) {
    return { valid: false, errors: [{ type: 'estrutura', kind: 'tabuleiro' }] };
  }
  const cols = transpose(grid);
  const errors = [];
  grid.forEach((row, i) => errors.push(...lineErrors(row, 'linha', i)));
  cols.forEach((col, i) => errors.push(...lineErrors(col, 'coluna', i)));
  errors.push(...duplicateErrors(grid, 'linha'), ...duplicateErrors(cols, 'coluna'));
  return { valid: errors.length === 0, errors };
}

const isComplete = (grid) => grid.every((r) => r.every((v) => v !== null));
const isSolved = (grid) => isComplete(grid) && validate(grid).valid;

/** Resolve por backtracking. Retorna nova matriz resolvida ou null. */
function solve(grid) {
  if (!validate(grid).valid) return null;
  const g = clone(grid);
  const go = () => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (g[r][c] !== null) continue;
        for (const v of [0, 1]) {
          g[r][c] = v;
          if (validate(g).valid && go()) return true;
        }
        g[r][c] = null;
        return false;
      }
    }
    return true;
  };
  return go() ? g : null;
}

class BinarySudoku {
  constructor(puzzle) {
    if (!Array.isArray(puzzle) || puzzle.length === 0) throw new TypeError('Puzzle deve ser uma matriz ou lista de linhas');
    const grid = typeof puzzle[0] === 'string' ? parse(puzzle) : clone(puzzle);
    if (grid.length !== SIZE || grid.some((r) => r.length !== SIZE)) throw new Error('Tabuleiro deve ser 6x6');
    this.grid = grid;
    this.fixed = grid.map((r) => r.map((v) => v !== null));
  }
  set(r, c, v) {
    if (![r, c].every((n) => Number.isInteger(n) && n >= 0 && n < SIZE)) throw new RangeError('Posição inválida');
    if (this.fixed[r][c]) throw new Error('Célula fixa não pode ser alterada');
    if (v !== 0 && v !== 1 && v !== null) throw new Error('Valor deve ser 0, 1 ou null');
    this.grid[r][c] = v;
  }
  validate() { return validate(this.grid); }
  isSolved() { return isSolved(this.grid); }
  solve() { return solve(this.grid); }
}

module.exports = { SIZE, parse, validate, isComplete, isSolved, solve, BinarySudoku };
