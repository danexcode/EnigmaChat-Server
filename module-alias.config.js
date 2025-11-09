const path = require('path');
const moduleAlias = require('module-alias');

// Determina el directorio base basado en NODE_ENV
const baseDir = process.env.NODE_ENV === 'production' ? 'dist' : 'src';

// Configura los alias
moduleAlias.addAliases({
  '@': path.resolve(__dirname, baseDir)
});

console.log(`Module aliases configured with base directory: ${baseDir}`);
