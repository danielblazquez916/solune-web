import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const walk = (directory, excluded = []) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (excluded.includes(entry.name) || entry.isSymbolicLink()) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path, excluded) : [path];
  });
const gitFiles = (args) =>
  execFileSync('git', [...args, '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
assert.ok(existsSync('.git'), 'Initialize Git before checking the candidate files.');
const candidates = [
  ...new Set(gitFiles(['ls-files', '--cached', '--others', '--exclude-standard'])),
];
const localFiles = walk('.', [
  'node_modules',
  '.git',
  '.wrangler',
  'dist',
  'graphify-out',
  'reports',
]);
const environmentFiles = localFiles.filter((file) =>
  /(?:^|[\\/])\.(?:env|dev\.vars)(?:\.|$)/.test(file),
);
const knownSecrets = [];
const isFixture = (value) =>
  /^(?:[123]x0+[AB]A|(?:unit|runtime)-test-not-a-real-secret)$/.test(value);
for (const file of environmentFiles) {
  const contents = readFileSync(file, 'utf8');
  if (file.endsWith('.example')) {
    assert.ok(
      !/^[ \t]*\w+[ \t]*=[ \t]*[^\s#]/m.test(contents),
      `Example must have empty values: ${file}`,
    );
  } else {
    assert.ok(
      !candidates.includes(relative('.', file).replaceAll('\\', '/')),
      `Local environment is versionable: ${file}`,
    );
    for (const line of contents.split(/\r?\n/)) {
      const match =
        /^\s*([A-Z_]*(?:SECRET|API_KEY|TOKEN|PASSWORD|PRIVATE)[A-Z_]*)\s*=\s*(.+?)\s*$/.exec(line);
      if (!match) continue;
      const value = match[2].replace(/^['"]|['"]$/g, '');
      if (value.length >= 12 && !isFixture(value)) knownSecrets.push(value);
    }
  }
}
const failures = [];
const patterns = [
  /\bre_[A-Za-z0-9_-]{20,}\b/,
  /\b(?:ghp_|github_pat_|sk_live_|sk-proj-|AKIA)[A-Za-z0-9_-]{16,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /https?:\/\/[^\s/'"`<>:]+:[^\s/'"`<>@]+@/,
];
function inspect(file, bundle = false) {
  const bytes = readFileSync(file);
  if (knownSecrets.some((secret) => bytes.includes(Buffer.from(secret))))
    failures.push(`${file}: local credential copied`);
  if (bytes.includes(0)) return;
  const text = bytes.toString('utf8');
  if (patterns.some((pattern) => pattern.test(text)))
    failures.push(`${file}: credential-like value`);
  const assignments = text.matchAll(
    /\b(?:[\w]*(?:SECRET_KEY|API_KEY|API_TOKEN|PASSWORD|PRIVATE_KEY))["']?\s*[:=]\s*['"]([^'"\r\n]+)['"]/gi,
  );
  for (const [, value] of assignments) {
    if (!isFixture(value) && !/^(?:\$\{|Bearer |test-|runtime-|unit-)/.test(value))
      failures.push(`${file}: hardcoded credential assignment`);
  }
  if (
    bundle &&
    /TURNSTILE_SECRET_KEY|RESEND_API_KEY|CLOUDFLARE_API_TOKEN|SERVER_ONLY_BUILD_CANARY|[123]x0{18,}|https?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/)/.test(
      text,
    )
  )
    failures.push(`${file}: server-only or development configuration in frontend`);
}
for (const file of candidates) if (existsSync(file)) inspect(file);
assert.ok(
  existsSync('dist/index.html'),
  'Run npm run build before checking the production assets.',
);
for (const file of walk('dist')) inspect(file, true);
for (const file of ['worker/wrangler.jsonc', 'worker/src/index.ts'])
  assert.ok(
    !/send_email|env\.EMAIL\b/.test(readFileSync(file, 'utf8')),
    `Obsolete mail binding: ${file}`,
  );
assert.deepEqual(failures, [], 'Credential audit failed (paths only; no values).');
mkdirSync('reports', { recursive: true });
writeFileSync('reports/git-candidate-files.txt', candidates.sort().join('\n') + '\n');
console.log(
  `PASS: ${candidates.length} versionable files and all dist assets scanned; no detected secrets. Local environment files ignored; examples empty.`,
);
console.log(
  'Candidate list: reports/git-candidate-files.txt (ignored). Review staged changes before each commit; this scan cannot detect every possible secret.',
);
