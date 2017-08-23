// @flow
import React, {Component, PropTypes} from 'react';
import {DatePicker} from 'antd';
import moment from "moment";
import * as app from './../../constants/app';


//TODO: ресет значений, если отмена
//TODO: время для сегодняшнего дня
class SettingsDataTimeRage extends Component {

  createRange = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  disabledRangeTime = (current, type, range) => {
    let disabled = {
      disabledSeconds: () => {
        return this.createRange(0, 60);
      }
    };

    if (range && Array.isArray(current) && current[type === 'start' ? 0 : 1].format('YYYY-MM-DD') === range[type].format('YYYY-MM-DD')) {
      let rangeHour = range[type].hour();
      let rangeMinute = range[type].minute();
      disabled.disabledHours = () => {
        return type === 'start' ? this.createRange(0, rangeHour) : this.createRange(rangeHour + 1, 24);
      };
      disabled.disabledMinutes = (selectedHour) => {
        if (selectedHour === rangeHour) {
          return type === 'start' ? this.createRange(0, rangeMinute) : this.createRange(rangeMinute + 1, 60);
        }
      };
    }

    return disabled;
  };

  disabledRangeDate = (current, range) => {
    let currentDate = current.clone().startOf('date');
    let rangeDate = range ? {
      start: range[0].clone().startOf('date'),
      end: range[1].clone().startOf('date'),
    } : null;
    let nowDate = moment().startOf('date');

    return this.filterRangeDataTime(currentDate, rangeDate, nowDate);
  };

  filterRangeDataTime = (current, range, now) => {
    let result = true;
    if (current) {
      let currentMs = current.valueOf();
      if (range) {
        let rangeMs = [
          range.start.valueOf(),
          range.end.valueOf()
        ];
        result = !currentMs.between(rangeMs, true);
      } else {
        let nowMs = now.valueOf();
        result = current > nowMs;
      }
    }

    return result;
  };

  render = () => {
    return (
      <DatePicker.RangePicker
        disabledDate={(item) => this.disabledRangeDate(item, this.props.valueLimit)}
        disabledTime={(date, type) => this.disabledRangeTime(date, type, this.props.valueLimit)}
        showTime={{hideDisabledOptions: true}}
        format={app.FORMAT_DATE_INPUT}
        placeholder={['Start time', 'End time']}
        {...this.props}
      />
    );
  }
}

SettingsDataTimeRage.propTypes = {
  valueLimit: PropTypes.array,
};

SettingsDataTimeRage.defaultProps = {
  valueLimit: null,
};

export default SettingsDataTimeRage;
