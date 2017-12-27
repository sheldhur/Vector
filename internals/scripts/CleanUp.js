const del = require('del');

del([
  'app/dist',
  'app/main.prod.js',
  'app/main.prod.js.map',
  'app/worker.prod.js',
  'app/worker.prod.js.map',
  'dll',
  'release',
]).then(paths => {
  console.log('Deleted files and folders:\n', paths.join('\n'));
});
