import React from 'react';
import {shell} from 'electron';
import {Icon, Progress, Tooltip, Row, List} from 'antd';

const getFileName = (path) => {
  return path.replace(/^.*[\\\/]/, '');
};

const WbrString = (props) => {
  return (
    <span dangerouslySetInnerHTML={{
      __html: props.children.replace(/\\/g, (str) => {
        return str + '<wbr />';
      })
    }}/>
  );
};

const FilePathTooltip = (props) => {
  if (props.children) {
    return (
      <Tooltip
        title={<WbrString>{props.children}</WbrString>}
        placement="right"
        overlayClassName="import-progress file-path"
      >{getFileName(props.children)}</Tooltip>
    );
  }

  return null;
};

const ImportProgressBar = (props) => {
  return (
    <Row className={'import-progress-bar' + (props.className ? ` ${props.className}` : '')}>
      <Progress percent={Math.ceil(props.progressBar.total)} className="animation-off"/>
      <small>
        File: <FilePathTooltip>{props.currentFile}</FilePathTooltip>
      </small>
      <Progress percent={Math.ceil(props.progressBar.current)} className="animation-off"/>
    </Row>
  );
};

const ImportLogList = (props) => {
  const ListItem = (props) => {
    const FileLink = (
      <a onClick={() => shell.showItemInFolder(props.filePath)}>
        <FilePathTooltip>{props.filePath}</FilePathTooltip>
      </a>
    );

    if (props.hasOwnProperty('error')) {
      return (
        <List.Item className="error">
          <List.Item.Meta
            title={<div>
              <Icon type="cross-circle"/> {FileLink} processing error
            </div>}
            description={<div>
              <strong>{props.error.name}: </strong>
              {props.error.message}
            </div>}
          />
        </List.Item>
      )
    } else {
      return (
        <List.Item className="info">
          <List.Item.Meta
            title={<div>
              <Icon type="exclamation-circle"/> {FileLink} no data for import
            </div>}
          />
        </List.Item>
      )
    }
  };

  return (
    <List
      className={'import-log-list' + (props.className ? ` ${props.className}` : '')}
      size="small"
      dataSource={props.data}
      renderItem={item => ListItem(item)}
    />
  );
};

const ImportProgress = (props) => {
  return (
    <div className={'import-progress' + (props.className ? ` ${props.className}` : '')}>
      <ImportProgressBar currentFile={props.currentFile} progressBar={props.progressBar}/>
      {props.importLog && props.importLog.length > 0 && <ImportLogList data={props.importLog}/>}
    </div>
  )
};

export default {
  WbrString,
  FilePathTooltip,
  ImportProgressBar,
  ImportLogList,
  ImportProgress
}
