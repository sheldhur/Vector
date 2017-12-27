import React from 'react';
import { Icon, Progress } from 'antd';

const BlinkedDots = (props) => (
  <span>
    {props.text}&nbsp;
    {'...'.split('').map((item, i) => <span key={i} className="blink-dot">.</span>)}
  </span>
);

const ChartAlert = (props) => (
  <div className={`centered-box ${props.className || ''}`} onContextMenu={props.onContextMenu}>
    <div>
      <h1><Icon type={props.icon} /></h1>
      <h3>{props.text}</h3>
      <p>{props.description}</p>
    </div>
  </div>
);

const NoDataAlert = (props) => (<ChartAlert
  icon="info-circle"
  text="No data available"
  {...props}
/>);

const ErrorAlert = (props) => (<ChartAlert
  icon="warning"
  text="No data available"
  {...props}
/>);

const LoadingAlert = (props) => (<ChartAlert
  icon="loading"
  text={<BlinkedDots text="Loading" />}
  {...props}
/>);

const ProgressAlert = (props) => {
  const status = props.error ? 'exception' : 'active';
  return (
    <div className={`progress-alert centered-box ${props.className || ''}`} onContextMenu={props.onContextMenu}>
      <div>
        <Progress
          type="circle"
          percent={props.percent || 0}
          width={60}
          strokeWidth={7}
          status={status}
        />
        <h3>{props.error ? props.error.name : <BlinkedDots text={props.text || 'Loading'} />}</h3>
        <p>{props.error ? props.error.message : props.description}</p>
      </div>
    </div>
  );
};

export default {
  ChartAlert,
  NoDataAlert,
  ErrorAlert,
  LoadingAlert,
  ProgressAlert
};
