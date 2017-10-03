// @flow
import React, {Component, PropTypes} from 'react';
import {Table, Input, Button, Icon} from 'antd';

import InputCell from './InputCell';
import CheckboxCell from './CheckboxCell';
import SelectCell from './SelectCell';
import ColorCell from './ColorCell';
import LineStyleCell from './LineStyleCell';

//TODO: Таблица с фильтрами обновляется.
//TODO: редактируемые ячейки возвразают [Object]
class Grid extends Component {

  constructor(props) {
    super(props);

    this.handlerFilterChange = ::this.handlerFilterChange;
    this.handlerFilter = ::this.handlerFilter;

    this.state = {
      filterDropdownVisible: false,
      filterValue: {},
      data: null
    };
  }

  columnSorter(dataIndex, a, b) {
    return -(a[dataIndex] < b[dataIndex]) || +(a[dataIndex] != b[dataIndex]);
    // return true;
  }

  columnFilter(item, reg) {
    let props = {};
    for (let dataIndex in reg) {
      let value = item[dataIndex].toString();
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
  }

  onChange(pagination, filters, sorter) {
    console.log('params', pagination, filters, sorter);
  }

  findParentElement(el, selector) {
    let popupEl = el;
    while ((popupEl = popupEl.parentElement) !== null) {
      if (popupEl.matches(selector)) {
        return popupEl;
        break;
      }
    }
  }

  handlerFilter(e, reset = false) {
    this.handlerFilterChange(e, reset);

    let filterValue = this.state.filterValue;

    let reg = {};
    for (let dataIndex in filterValue) {
      if (filterValue[dataIndex] !== '') {
        reg[dataIndex] = new RegExp('(' + filterValue[dataIndex] + ')+', 'gi');
      }
    }

    let data = this.filterData(this.props.data, reg);

    this.setState({
      filterDropdownVisible: false,
      data,
      filterValue
    });
  }

  filterData (data, reg) {
    if (data) {
      data = data.map((item, i) => {
        return this.columnFilter(item, reg);
      }).filter(item => !!item);
    }

    return data;
  }

  handlerFilterChange(e, reset = false) {
    let input = this.findParentElement(e.target, '.custom-filter-dropdown').querySelector('input');
    if (reset) {
      input.value = '';
    }

    let filterDropdownVisible = input.name;
    let {filterValue} = this.state;
    if (filterDropdownVisible) {
      filterValue[filterDropdownVisible] = input.value;
      this.setState({
        filterValue
      });
    }
  }

  prepareColumns(columns) {
    let {filterValue, filterDropdownVisible} = this.state;
    return columns.map((item, i) => {
      let propsSorter = item.hasSorter ? {
        sorter: (a, b) => this.columnSorter(item.dataIndex, a, b),
      } : {};
      let propsFilter = item.hasFilter ? {
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              placeholder="Search"
              ref={(el) => this.searchInput = el}
              onPressEnter={this.handlerFilter}
              name={item.dataIndex}
            />
            <Button.Group>
              <Button type="primary" onClick={this.handlerFilter}>
                <Icon type="search"/>
              </Button>
              <Button onClick={(e) => {
                this.handlerFilter(e, true)
              }}>
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
  }

  filterProps(props, removeProps) {
    let tableProps = {};
    for (let name in props) {
      if (removeProps.indexOf(name)) {
        tableProps[name] = props[name];
      }
    }

    return tableProps;
  }

  render() {
    let columns = this.prepareColumns(this.props.columns);
    let data = this.state.data ? this.state.data : this.props.data;
    const tableProps = this.filterProps(this.props, ['data', 'columns']);

    if (tableProps.pagination && tableProps.size === 'x-small' && tableProps.pagination !== undefined && !tableProps.pagination.size !== undefined) {
      tableProps.pagination.size = 'small';
    }

    return (
      <Table
        {...tableProps}
        columns={columns}
        dataSource={data}
      />
    );
  }
}


Grid.propTypes = {};

Grid.defaultProps = {};

Grid.InputCell = InputCell;
Grid.CheckboxCell = CheckboxCell;
Grid.SelectCell = SelectCell;
Grid.ColorCell = ColorCell;
Grid.LineStyleCell = LineStyleCell;

export default Grid;
