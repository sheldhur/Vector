function isMergeableObject(value) {
  return isNonNullObject(value) && isNotSpecial(value)
}

function isNonNullObject(value) {
  return !!value && typeof value === 'object'
}

function isNotSpecial(value) {
  var stringValue = Object.prototype.toString.call(value);

  return stringValue !== '[object RegExp]'
    && stringValue !== '[object Date]'
    && !value.hasOwnProperty('_isAMomentObject')
}

export default function deepAssign(destination, source, arrayMerge) {
  for (let key in destination) {
    if (source.hasOwnProperty(key)) {
      if (isMergeableObject(destination[key])) {
        destination[key] = deepAssign(destination[key], source[key], arrayMerge);
      } else {
        if (Array.isArray(destination[key]) && typeof arrayMerge === 'function') {
          destination[key] = arrayMerge(destination[key], source[key], arrayMerge);
        } else {
          destination[key] = source[key];
        }
      }
    }
  }

  return destination;
}
