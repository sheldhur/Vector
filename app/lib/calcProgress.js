export default (filesLength, fileCurrent, rowsLength, rowCurrent) => {
  if (Array.isArray(filesLength)) {
    filesLength = filesLength.length;
  }
  if (Array.isArray(rowsLength)) {
    rowsLength = rowsLength.length;
  }

  const percentFile = 100 / filesLength;
  const percentFiles = percentFile * fileCurrent;
  const percentCurrent = 100 / rowsLength * (rowCurrent + 1);
  const percentFileRows = percentFile / 100 * percentCurrent;
  const percentTotal = percentFiles + percentFileRows;

  return {
    current: Math.ceil(percentCurrent),
    total: Math.ceil(percentTotal),
  };
}
