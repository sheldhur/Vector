// @flow
import React, {Component} from 'react';
import {Table, Input, Button, Icon} from 'antd';

import InputCell from './InputCell';
import CheckboxCell from './CheckboxCell';
import SelectCell from './SelectCell';
import ColorCell from './ColorCell';
import LineStyleCell from './LineStyleCell';

const isProd = process.env.NODE_ENV === 'production';

class Grid extends Component {

  state = {
    filterDropdownVisible: false,
    filterValue: {},
    data: null
  };

  componentWillReceiveProps = (nextProp) => {
    if (this.props.data.length !== nextProp.data.length) {
      this.handlerFilter(null, nextProp.data);
    }
  };

  columnSorter = (dataIndex, a, b) => {
    return -(a[dataIndex] < b[dataIndex]) || +(a[dataIndex] != b[dataIndex]);
    // return true;
  };

  columnFilter = (item, reg) => {
    const props = {};
    for (let dataIndex in reg) {
      const value = item[dataIndex].toString();
      const match = value.match(reg[dataIndex]);
      if (!match) {
        return null;
      } else {
        props[dataIndex] = {
          text: value,
          search: reg[dataIndex],
          updateFilter: () => {
            this.setState({
              data: this.filterData(this.props.data, reg)
            });
            console.log('updateFilter');
          }
        }
      }
    }
    return {...item, ...props};
  };

  onChange = (pagination, filters, sorter) => {
    console.log('params', pagination, filters, sorter);
  };

  findParentElement = (el, selector) => {
    let popupEl = el;
    while ((popupEl = popupEl.parentElement) !== null) {
      if (popupEl.matches(selector)) {
        return popupEl;
        break;
      }
    }
  };

  handlerFilter = (e, rawData, reset = false) => {
    if (e) {
      this.handlerFilterChange(e, reset);
    }

    const filterValue = this.state.filterValue;

    const reg = {};
    for (let dataIndex in filterValue) {
      if (filterValue[dataIndex] !== '') {
        reg[dataIndex] = new RegExp('(' + filterValue[dataIndex] + ')+', 'gi');
      }
    }

    const data = this.filterData(rawData, reg);

    this.setState({
      filterDropdownVisible: false,
      data,
      filterValue
    });
  };

  filterData = (data, reg) => {
    if (data) {
      data = data.map((item, i) => {
        return this.columnFilter(item, reg);
      }).filter(item => !!item);
    }

    return data;
  };

  handlerFilterChange = (e, reset = false) => {
    const input = this.findParentElement(e.target, '.custom-filter-dropdown').querySelector('input');
    if (reset) {
      input.value = '';
    }

    const filterDropdownVisible = input.name;
    const {filterValue} = this.state;
    if (filterDropdownVisible) {
      filterValue[filterDropdownVisible] = input.value;
      this.setState({
        filterValue
      });
    }
  };

  prepareColumns = (columns) => {
    const {filterValue, filterDropdownVisible} = this.state;
    return columns.map((item, i) => {
      const propsSorter = item.hasSorter ? {
        sorter: (a, b) => this.columnSorter(item.dataIndex, a, b),
      } : {};
      const propsFilter = item.hasFilter ? {
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              placeholder="Search"
              ref={(el) => this.searchInput = el}
              onPressEnter={e => this.handlerFilter(e, this.props.data)}
              name={item.dataIndex}
            />
            <Button.Group>
              <Button type="primary" onClick={e => this.handlerFilter(e, this.props.data)}>
                <Icon type="search"/>
              </Button>
              <Button onClick={e => this.handlerFilter(e, this.props.data, true)}>
                <Icon type="delete"/>
              </Button>
            </Button.Group>
          </div>
        ),
        filterIcon: <Icon
          type="filter"
          style={{color: filterValue[item.dataIndex] !== undefined && filterValue[item.dataIndex] !== '' ? '#108ee9' : '#aaa'}}
        />,
        filterDropdownVisible: filterDropdownVisible === item.dataIndex,
        onFilterDropdownVisibleChange: visible => this.setState({filterDropdownVisible: visible ? item.dataIndex : false}, () => this.searchInput.focus())
      } : {};

      return {...item, ...propsSorter, ...propsFilter};
    });
  };

  filterProps = (props, removeProps) => {
    let tableProps = {};
    for (let name in props) {
      if (removeProps.indexOf(name)) {
        tableProps[name] = props[name];
      }
    }

    return tableProps;
  };

  render = () => {
    const columns = this.prepareColumns(this.props.columns);
    const data = this.state.data ? this.state.data : this.props.data;
    const tableProps = this.filterProps(this.props, ['data', 'columns']);

    if (tableProps.pagination && tableProps.size === 'x-small') {
      tableProps.pagination.size = 'small';
    }

    if (!isProd) {
      console.info('GRID RERENDER ' + window.location.href);
    }

    return (
      <Table
        {...tableProps}
        columns={columns}
        dataSource={data}
      />
    );
  };
}


Grid.propTypes = {};

Grid.defaultProps = {};

Grid.InputCell = InputCell;
Grid.CheckboxCell = CheckboxCell;
Grid.SelectCell = SelectCell;
Grid.ColorCell = ColorCell;
Grid.LineStyleCell = LineStyleCell;

export default Grid;
