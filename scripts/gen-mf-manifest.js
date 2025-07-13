const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extract remotes from environment
function extractRemotesFromEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const remotesMatch = content.match(/remotes\s*:\s*{([^}]*)}/s);
  if (!remotesMatch) return {};
  const remotesObj = {};
  [...remotesMatch[1].matchAll(/([a-zA-Z0-9_]+)\s*:\s*['"]([^'"]+)['"]/g)].forEach(
    m => remotesObj[m[1]] = m[2]
  );
  return remotesObj;
}

// Extract requiredVersion for shared deps from webpack.config.js
function extractRequiredVersionsFromWebpack(webpackPath) {
  if (!fs.existsSync(webpackPath)) return {};
  const content = fs.readFileSync(webpackPath, 'utf8');
  // Matches "@lib": { ... requiredVersion: "..." }
  const regex = /['"]([^'"]+)['"]\s*:\s*{[^}]*?requiredVersion\s*:\s*['"]([^'"]+)['"][^}]*?}/g;
  const versions = {};
  let match;
  while ((match = regex.exec(content))) {
    versions[match[1]] = match[2];
  }
  return versions;
}

// Get installed dep versions from lock
function getInstalledDepVersions(lock, deps) {
  const result = {};
  if (lock && lock.packages) {
    Object.keys(deps).forEach(dep => {
      const pkgInfo = lock.packages[`node_modules/${dep}`];
      if (pkgInfo && pkgInfo.version) result[dep] = pkgInfo.version;
    });
  } else if (lock && lock.dependencies) {
    Object.keys(deps).forEach(dep => {
      if (lock.dependencies[dep] && lock.dependencies[dep].version) {
        result[dep] = lock.dependencies[dep].version;
      }
    });
  }
  return result;
}

// Extract MFE name from webpack config
function readMfName(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/name:\s*['"](.+?)['"]/);
  return match ? match[1] : null;
}

// Paths
const repoRoot = path.join(__dirname, '..');
const isProd = process.argv[2] === 'prod';
const envPath = isProd
  ? path.join(repoRoot, 'src/environments/environment.prod.ts')
  : path.join(repoRoot, 'src/environments/environment.ts');
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8'));
const webpackPath = path.join(repoRoot, 'webpack.config.js');
const lockPath = path.join(repoRoot, 'package-lock.json');
const lock = fs.existsSync(lockPath)
  ? JSON.parse(fs.readFileSync(lockPath, 'utf-8'))
  : null;

// Collect info
const mfName = readMfName(webpackPath) || pkg.name;
const envRemotes = extractRemotesFromEnv(envPath);
const webpackRequiredVersions = extractRequiredVersionsFromWebpack(webpackPath);

const remotes = Object.entries(envRemotes)
  .filter(([key]) => key !== mfName) // ignore self
  .reduce((acc, [key, remoteEntryUrl]) => {
    acc[key] = remoteEntryUrl.replace(/remoteEntry\.js$/, 'mf-manifest.json');
    return acc;
  }, {});

// Dependencies: declared + installed + requiredVersion
const declaredDeps = pkg.dependencies || {};
const installedDeps = lock ? getInstalledDepVersions(lock, declaredDeps) : {};

const dependencies = {};
Object.keys(declaredDeps).forEach(dep => {
  dependencies[dep] = {
    declared: declaredDeps[dep],
    installed: installedDeps[dep] || null,
    requiredVersion: webpackRequiredVersions[dep] || null
  };
});

// Get latest commit hash from main branch (useful on CI)
function getLatestMainCommit() {
  try {
    // Pega o hash do último commit na main local. Se estiver na CI, garanta que 'main' está atualizado.
    return execSync('git rev-parse origin/main').toString().trim();
  } catch (e) {
    // fallback pra HEAD atual, se estiver rodando só na main
    try {
      return execSync('git rev-parse HEAD').toString().trim();
    } catch (e2) {
      return null;
    }
  }
}

// Manifest final
const manifest = {
  name: mfName,
  version: pkg.version,
  id: getLatestMainCommit(),
  remotes,
  dependencies,
};

// const outFile = path.join(repoRoot, 'mf-manifest.json');
// fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(JSON.stringify(manifest, null, 2));
