const del = require('del');

del([
  'app/dist',
  'app/main.js',
  'app/main.js.map',
  'app/worker.js',
  'app/worker.js.map',
  'release'
]).then(paths => {
  console.log('Deleted files and folders:\n', paths.join('\n'));
});
