#!/usr/bin/env node
// Guarda da convenção `semi: always` descrita no README.
//
// Uso:  node .github/scripts/verificar-ponto-e-virgula.mjs [arquivo...]
//       sem argumento, varre todos os .ts e .mts versionados
//
// Node puro, sem nenhuma dependência: o acervo não tem dependência npm própria, e um
// guarda de estilo não é motivo para abrir essa exceção.
//
// Ele não é o inverso de um formatador. Escrever ponto e vírgula na posição certa exige um
// parser de verdade; DETECTAR ausência não exige - basta ler o fim de cada linha de código,
// desde que se saiba o que é código. Daí as duas partes abaixo: um scanner que separa código
// de texto, e uma lista de fins de linha que dispensam ponto e vírgula.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const alvos =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : execFileSync('git', ['ls-files', '*.ts', '*.mts'], { encoding: 'utf8' }).trim().split('\n');

// Um caractere destes no fim da linha significa que o statement continua ou que um bloco
// acaba de abrir. Nenhum deles encerra coisa alguma.
const CONTINUA = new Set(['{', '(', '[', ',', ':', '.', '=', '+', '-', '*', '/', '%', '&', '|', '?', '<', '>', '^', '~']);

// A linha SEGUINTE começar com um destes significa que a anterior não terminou: é
// encadeamento quebrado (`.then`), fechamento adiado ou operador binário no início.
// O `?` solto cobre o ternário quebrado em três linhas, que o acervo usa bastante:
//   const alvo = caminho.startsWith('~')
//     ? path.join(os.homedir(), caminho.slice(1))
//     : caminho;
const CONTINUA_NA_PROXIMA = ['.', '?', ')', ']', '}', ',', ':', '&&', '||', '+', '-', '*', '/', '=', '<', '>', '|', '&', '`'];

// Cabeçalho de bloco escrito sem chaves, com o corpo na linha seguinte. Não é statement: o
// statement é o corpo, e é ele que encerra.
//   if (titlebar)
//     titlebar.style.backgroundColor = cor;
const CABECALHO_SEM_CHAVES = /^(else$|(else\s+)?(if|for|while)\s*\(.*\)$)/;

// Percorre o arquivo inteiro guardando estado de string, template literal e comentário de
// bloco, e devolve, por linha, só o que é código. Sem isso, um ponto e vírgula dentro de uma
// crase de várias linhas passaria por statement.
function codigoPorLinha(texto) {
  const linhas = texto.split('\n');
  const saida = [];
  let emBloco = false;
  let emTemplate = false;

  for (const linha of linhas) {
    let codigo = '';
    let i = 0;
    let aspas = null;

    while (i < linha.length) {
      const c = linha[i];
      const d = linha[i + 1];

      if (emBloco) {
        if (c === '*' && d === '/') {
          emBloco = false;
          i += 2;
          continue;
        }
        i++;
        continue;
      }
      if (emTemplate) {
        if (c === '\\') {
          i += 2;
          continue;
        }
        if (c === '`') {
          emTemplate = false;
          codigo += '`';
        }
        i++;
        continue;
      }
      if (aspas) {
        if (c === '\\') {
          i += 2;
          continue;
        }
        if (c === aspas) {
          aspas = null;
          codigo += 'S';
        }
        i++;
        continue;
      }
      if (c === '/' && d === '/') break;
      if (c === '/' && d === '*') {
        emBloco = true;
        i += 2;
        continue;
      }
      if (c === '`') {
        emTemplate = true;
        codigo += '`';
        i++;
        continue;
      }
      if (c === '"' || c === "'") {
        aspas = c;
        codigo += 'S';
        i++;
        continue;
      }
      codigo += c;
      i++;
    }
    saida.push(emTemplate || emBloco ? '' : codigo.trimEnd());
  }
  return saida;
}

function proximaSignificativa(linhas, i) {
  for (let j = i + 1; j < linhas.length; j++) {
    const t = linhas[j].trim();
    if (t !== '') return t;
  }
  return '';
}

const faltas = [];

for (const arquivo of alvos) {
  if (arquivo === '') continue;
  const fonte = readFileSync(arquivo, 'utf8');
  const originais = fonte.split('\n');
  const linhas = codigoPorLinha(fonte);

  for (let i = 0; i < linhas.length; i++) {
    const t = linhas[i].trim();
    if (t === '') continue;
    if (t.endsWith(';')) continue;
    // Diretiva triple-slash é comentário, não statement.
    if (t.startsWith('///')) continue;

    const ultimo = t[t.length - 1];
    if (CONTINUA.has(ultimo)) continue;
    if (CABECALHO_SEM_CHAVES.test(t)) continue;
    // Fim de bloco: função, classe, interface, if, for, while, switch, try.
    if (t === '}') continue;
    // Corpo vazio de método, construtor ou classe. O `export {}` NÃO é corpo vazio: é uma
    // declaração de exportação, e essa encerra.
    if (t.endsWith('{}') && !/^export\s*\{\s*\}$/.test(t)) continue;

    const prox = proximaSignificativa(linhas, i);
    if (CONTINUA_NA_PROXIMA.some((p) => prox.startsWith(p))) continue;

    // Reporta a linha do arquivo, e não o código efetivo: este último troca cada string por
    // um marcador, o que confunde quem lê a falha no CI.
    faltas.push(`${arquivo}:${i + 1}  ${originais[i].trim()}`);
  }
}

if (faltas.length > 0) {
  console.error(`[FAIL] ${faltas.length} statement(s) sem ponto e virgula:\n`);
  for (const f of faltas) console.error('  ' + f);
  console.error('\nA convencao esta na secao "Convencoes de estilo" do README.md.');
  process.exit(1);
}
console.log(`[OK] ${alvos.length} arquivo(s): todo statement termina em ponto e virgula.`);
