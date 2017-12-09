// @flow
import React, {Component} from 'react';
import {Select} from 'antd';

class MagnetopauseSettingsSelector extends Component {

  handlerChange = (optionValue) => {
    this.props.onChange([...this.props.value, parseInt(optionValue)]);
  };

  render() {
    const {value, dataSets} = this.props;

    return (
      <Select
        placeholder="Select dataset"
        optionFilterProp="children"
        size={this.props.size}
        showSearch
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        onChange={this.handlerChange}
      >
        {dataSets.filter(dataSet => value.indexOf(dataSet.id) === -1).map((dataSet, i) => {
          return <Select.Option
            key={dataSet.id.toString()}>{dataSet.name} {dataSet.si ? `(${dataSet.si})` : null}</Select.Option>;
        })}
      </Select>
    );
  }
}

export default MagnetopauseSettingsSelector;
