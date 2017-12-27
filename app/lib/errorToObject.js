export default function errorToObject(error, property = ['name', 'message', 'stack']) {
  const result = {};

  property.forEach((item) => {
    result[item] = error[item];
  });

  return result;
}
