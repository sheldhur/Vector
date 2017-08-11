export default (pathProd, pathDev) => {
  const isProd = process.env.NODE_ENV === 'production';
  return require('path').resolve(process.mainModule.filename, '..', (!isProd && pathDev ? pathDev : pathProd));
};
