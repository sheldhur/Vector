import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import moment from 'moment';
import { FORMAT_DATETIME_INPUT, FORMAT_TIME_INPUT, FORMAT_DATE_INPUT } from '../../constants/app';
import { numberIsBetween, createRange } from '../../utils/helper';


class SettingsDataTimeRage extends Component {
  valuesToMap = (values) => (
    (Array.isArray(values) && values.length === 2) ? {
      start: values[0],
      end: values[1],
    } : values
  );

  disabledRangeTime = (current, type, range) => {
    const disabled = {};

    if (current && Array.isArray(current)) {
      const currentMap = this.valuesToMap(current);

      if (range && Array.isArray(range)) {
        const rangeMap = this.valuesToMap(range);

        if (currentMap[type].format(FORMAT_DATE_INPUT) === rangeMap[type].format(FORMAT_DATE_INPUT)) {
          const rangeHour = rangeMap[type].hour();
          const rangeMinute = rangeMap[type].minute();

          if (type === 'start') {
            disabled.disabledHours = () => createRange(0, rangeHour);
            disabled.disabledMinutes = () => createRange(0, rangeMinute);
          } else if (type === 'end') {
            disabled.disabledHours = () => createRange(rangeHour + 1, 24);
            disabled.disabledMinutes = () => createRange(rangeMinute + 1, 60);
          }
        }
      } else {
        const now = moment();
        if (currentMap[type].format(FORMAT_DATE_INPUT) === now.format(FORMAT_DATE_INPUT)) {
          const nowHour = now.hour();
          const nowMinute = now.minute();

          disabled.disabledHours = () => createRange(nowHour + 1, 24);
          if (currentMap[type].hour() === nowHour) {
            disabled.disabledMinutes = () => createRange(nowMinute + 1, 60);
          }
        }
      }
    }

    return disabled;
  };

  disabledRangeDate = (current, range) => {
    if (current) {
      if (range && Array.isArray(range)) {
        const currentDate = current.clone().startOf('date');
        const rangeDate = range.map((item) => (item ? item.clone().startOf('date') : item));
        const nowDate = moment().startOf('date');

        return this.filterRangeDataTime(currentDate, rangeDate, nowDate);
      }

      return current > moment().endOf('day');
    }

    return false;
  };

  filterRangeDataTime = (current, range, now) => {
    let result = true;
    if (current) {
      const currentMs = current.valueOf();
      if (range) {
        const rangeMs = range.map(item => item.valueOf());
        result = !numberIsBetween(currentMs, rangeMs);
      } else {
        const nowMs = now.valueOf();
        result = current > nowMs;
      }
    }

    return result;
  };

  render = () => (
    <DatePicker.RangePicker
      disabledDate={(date) => this.disabledRangeDate(date, this.props.valueLimit)}
      disabledTime={(date, type) => this.disabledRangeTime(date, type, this.props.valueLimit)}
      showTime={{
        format: FORMAT_TIME_INPUT
      }}
      format={FORMAT_DATETIME_INPUT}
      placeholder={['Start time', 'End time']}
      {...this.props}
    />
  );
}

SettingsDataTimeRage.propTypes = {
  valueLimit: PropTypes.array,
};

SettingsDataTimeRage.defaultProps = {
  valueLimit: null,
};

export default SettingsDataTimeRage;
