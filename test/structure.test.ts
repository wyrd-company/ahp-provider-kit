import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { basename, join } from 'node:path';
import { test } from 'node:test';

import ts from 'typescript';

const SRC_DIR = fileURLToPath(new URL('../src', import.meta.url));

/** Recursively collect every `.ts` file under `dir`. */
function collectTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function parse(file: string): ts.SourceFile {
  const source = ts.sys.readFile(file) ?? '';
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
}

function hasExportModifier(node: ts.Node): boolean {
  return (
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node) ?? []).some(m => m.kind === ts.SyntaxKind.ExportKeyword)
  );
}

/** Names of top-level exported *declarations* (interfaces, types, classes, functions, enums, vars). */
function exportedDeclarationNames(source: ts.SourceFile): string[] {
  const names = new Set<string>();
  for (const stmt of source.statements) {
    if (!hasExportModifier(stmt)) {
      continue;
    }
    if (
      ts.isInterfaceDeclaration(stmt) ||
      ts.isTypeAliasDeclaration(stmt) ||
      ts.isClassDeclaration(stmt) ||
      ts.isFunctionDeclaration(stmt) ||
      ts.isEnumDeclaration(stmt)
    ) {
      if (stmt.name) {
        names.add(stmt.name.text);
      }
    } else if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          names.add(decl.name.text);
        }
      }
    }
  }
  return [...names];
}

/** A barrel may contain only `export … from '…'` re-exports — nothing else. */
function nonReexportStatements(source: ts.SourceFile): ts.Statement[] {
  return source.statements.filter(stmt => {
    const isReexport = ts.isExportDeclaration(stmt) && stmt.moduleSpecifier !== undefined;
    return !isReexport;
  });
}

function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

const files = collectTsFiles(SRC_DIR);
const barrels = files.filter(f => basename(f) === 'index.ts');
const leaves = files.filter(f => basename(f) !== 'index.ts');

test('every leaf file exports exactly one symbol named after the file', () => {
  for (const file of leaves) {
    const source = parse(file);
    const names = exportedDeclarationNames(source);
    const rel = file.slice(SRC_DIR.length + 1);

    assert.equal(
      names.length,
      1,
      `${rel} must export exactly one symbol, found: [${names.join(', ')}]`,
    );

    const expectedStem = toKebabCase(names[0]);
    const actualStem = basename(file, '.ts');
    assert.equal(
      actualStem,
      expectedStem,
      `${rel} exports "${names[0]}" — expected file name "${expectedStem}.ts"`,
    );
  }
});

test('barrels contain only re-exports', () => {
  for (const file of barrels) {
    const source = parse(file);
    const offenders = nonReexportStatements(source);
    const rel = file.slice(SRC_DIR.length + 1);
    assert.equal(
      offenders.length,
      0,
      `${rel} is a barrel and may only contain \`export … from\` statements`,
    );
  }
});
