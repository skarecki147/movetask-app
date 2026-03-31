const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs', '.json'];

function resolveExistingFile(baseWithoutExt) {
  for (const ext of EXTENSIONS) {
    const filePath = baseWithoutExt + ext;
    try {
      if (fs.statSync(filePath).isFile()) {
        return path.normalize(filePath);
      }
    } catch {
      /* continue */
    }
  }
  for (const ext of EXTENSIONS) {
    const indexFile = path.join(baseWithoutExt, `index${ext}`);
    try {
      if (fs.statSync(indexFile).isFile()) {
        return path.normalize(indexFile);
      }
    } catch {
      /* continue */
    }
  }
  return null;
}

/**
 * Web / SSR can resolve `@/` before Babel in some pipelines; map explicitly to disk.
 */
function resolveAtPath(moduleName) {
  if (!moduleName.startsWith('@/')) {
    return null;
  }
  const rest = moduleName.slice(2);
  const roots = [
    ['shared/', path.join(projectRoot, 'src', 'shared')],
    ['modules/', path.join(projectRoot, 'src', 'modules')],
    ['store/', path.join(projectRoot, 'src', 'store')],
    ['providers/', path.join(projectRoot, 'src', 'providers')],
    ['components/', path.join(projectRoot, 'components')],
    ['constants/', path.join(projectRoot, 'constants')],
  ];
  for (const [prefix, base] of roots) {
    if (rest.startsWith(prefix)) {
      const sub = rest.slice(prefix.length);
      return resolveExistingFile(path.join(base, sub));
    }
  }
  return resolveExistingFile(path.join(projectRoot, rest));
}

module.exports = (() => {
  const config = getDefaultConfig(projectRoot);
  const previousResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const filePath = resolveAtPath(moduleName);
    if (filePath) {
      return { type: 'sourceFile', filePath };
    }
    if (previousResolveRequest) {
      return previousResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
  return config;
})();
