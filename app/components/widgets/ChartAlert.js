import React from 'react';
import {Icon} from 'antd';

export const ChartAlert = (props) => {
  return (
    <div className={`centered-box ${props.className || ''}`} onContextMenu={props.onContextMenu}>
      <div>
        <h1><Icon type={props.icon}/></h1>
        <h3>{props.text}</h3>
        <p>{props.description}</p>
      </div>
    </div>
  );
};

export const LoadingAlert = (props) => {
  return (<ChartAlert
    icon="loading"
    text="Loading..."
    {...props}
  />)
};

export const NoDataAlert = (props) => {
  return (<ChartAlert
    icon="info-circle"
    text="No data available"
    {...props}
  />)
};

export const ErrorAlert = (props) => {
  return (<ChartAlert
    icon="info-circle"
    text="No data available"
    {...props}
  />)
};
