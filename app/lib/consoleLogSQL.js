// import highliteSQl from 'sequelize-log-syntax-colors';
import sqlformatter from 'sqlformatter';

function highliteSQl(text, outputType = 'bash') {
  var keyWords = [
      'PRAGMA', 'CREATE', 'EXISTS', 'INTEGER', 'PRIMARY', 'VARCHAR',
      'DATETIME', 'NULL', 'REFERENCES', 'AND', 'AS', 'ASC', 'INDEX_LIST',
      'BETWEEN', 'BY', 'CASE', 'CURRENT_DATE', 'CURRENT_TIME', 'DELETE',
      'DESC', 'DISTINCT', 'EACH', 'ELSE', 'ELSEIF', 'FALSE', 'FOR', 'FROM',
      'GROUP', 'HAVING', 'IF', 'IN', 'INSERT', 'INTERVAL', 'INTO', 'IS',
      'JOIN', 'KEY', 'KEYS', 'LEFT', 'LIKE', 'LIMIT', 'MATCH', 'NOT',
      'ON', 'OPTION', 'OR', 'ORDER', 'OUT', 'OUTER', 'REPLACE', 'TINYINT',
      'RIGHT', 'SELECT', 'SET', 'TABLE', 'THEN', 'TO', 'TRUE', 'UPDATE',
      'VALUES', 'WHEN', 'WHERE', 'UNSIGNED', 'CASCADE', 'UNIQUE', 'DEFAULT',
      'ENGINE', 'TEXT', 'auto_increment', 'SHOW', 'INDEX'
    ],
    len = keyWords.length,
    i;

  //adding lowercase keyword support
  for (i = 0; i < len; i += 1) {
    keyWords.push(keyWords[i].toLowerCase());
  }

  var regEx;
  var color = {
    none: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
  }
  // just store original
  // to  compare for
  var newText = text;

  // regex time
  // looking fo defaults
  // newText = newText.replace(/Executing \(default\): /g, '');

  //numbers - same color as strings
  newText = newText.replace(/(\d+)/g, color.green + '$1' + color.none);

  // special chars
  newText = newText.replace(/(=|%|\/|\*|-|,|;|:|\+|<|>)/g, color.yellow + '$1' + color.none);

  //strings - text inside single quotes and backticks
  newText = newText.replace(/(['`].*?['`])/g, color.green + '$1' + color.none);

  //functions - any string followed by a '('
  newText = newText.replace(/(\w*?)\(/g, color.red + '$1' + color.none + '(');

  //brackets - same as special chars
  newText = newText.replace(/([\(\)])/g, color.yellow + '$1' + color.none);

  //reserved mysql keywords
  for (i = 0; i < keyWords.length; i += 1) {
    //regex pattern will be formulated based on the array values surrounded by word boundaries. since the replace function does not accept a string as a regex pattern, we will use a regex object this time
    regEx = new RegExp('\\b' + keyWords[i] + '\\b', 'g');
    newText = newText.replace(regEx, color.magenta + keyWords[i] + color.none);
  }

  if (outputType === 'css') {
    let colorCSS = {};
    for (let name in color) {
      colorCSS[color[name]] = name;
    }

    let colorParams = newText.match(/\x1b\[[\d]{1,2}m/ig).map((item) => {
      let color = colorCSS[item];
      let style = '';
      switch (color) {
        case 'magenta':
          style = 'font-weight: bold; color: blue';
          break;
        case 'yellow':
          style = 'color: black';
          break;
        default:
          style = 'font-weight: bold; color:' + color;
      }

      return style;
    });

    newText = newText.replace(/\x1b\[[\d]{1,2}m/ig, '%c');
    colorParams.unshift(newText);

    return colorParams;
  }

  return newText;
}

export default function (string) {
  let stringSplit = string.match(/(.*executing\s+\([^\s]+\):\s)(.+(\s+.+)*)/i);

  try {
    console.groupCollapsed.apply(console, highliteSQl(stringSplit[1] + stringSplit[2].replace(/[\r\n\s]+/g, ' '), 'css'));
    console.log.apply(console, highliteSQl(stringSplit[1] + sqlformatter.format(stringSplit[2]), 'css'));
    console.groupEnd();
  } catch (e) {
    throw new Error("Can't parse query string: " + string);
  }
}
