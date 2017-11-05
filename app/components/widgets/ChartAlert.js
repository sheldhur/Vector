import React from 'react';
import {Icon} from 'antd';

export const ChartAlert = (props) => {
  return (
    <div className="centered-box" onContextMenu={props.onContextMenu}>
      <div>
        <h1><Icon type={props.icon}/></h1>
        <h3>{props.text}</h3>
        <p>{props.description}</p>
      </div>
    </div>
  );
};
