export default function errorToObject(error, property = ['name', 'message', 'stack']) {
  let result = {};

  property.forEach((item) => {
    result[item] = error[item];
  });

  return result;
}
