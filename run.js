#!/usr/bin/env node
// Direct production runner - bypass npm script overhead
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';
require('./dist/index.cjs');
