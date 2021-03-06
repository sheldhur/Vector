import { DATA_SET_COLOR } from '../constants/app';


export const dataSetsForChart = (dataSets, dataSetValues, filter) => {
  const colorGroup = DATA_SET_COLOR;

  if (typeof filter !== 'function') {
    filter = () => true;
  }

  const chartGroups = {};
  for (const dataSetId in dataSets) {
    const dataSet = dataSets[dataSetId];
    if (dataSet && filter(dataSet)) {
      const dataSetLine = {
        name: dataSet.name,
        si: dataSet.si,
        format: '%(name)s: %(y).5g %(si)s',
        style: {
          stroke: dataSet.style.stroke || colorGroup[dataSetId % colorGroup.length],
          strokeWidth: 1,
          ...dataSet.style
        },
        points: dataSetValues[dataSet.id] ? dataSetValues[dataSet.id].map((dataSetValue) => ({
          x: dataSetValue.time,
          y: !dataSet.badValue || Math.abs(dataSetValue.value) < dataSet.badValue ? dataSetValue.value : null
        })) : null
      };

      if (chartGroups[dataSet.axisGroup] === undefined) {
        chartGroups[dataSet.axisGroup] = {
          si: null,
          lines: [],
        };
      }

      chartGroups[dataSet.axisGroup].lines.push(dataSetLine);
      chartGroups[dataSet.axisGroup].si = chartGroups[dataSet.axisGroup].si || dataSetLine.si;
    }
  }

  return Object.values(chartGroups);
};
