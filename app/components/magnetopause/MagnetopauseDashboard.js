import React, {Component} from 'react'
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ResizeblePanel, Panel} from '../widgets/ResizeblePanel';
import MagnetopauseMap from './MagnetopauseMap';
import MagnetopauseChart from './MagnetopauseChart';
import {NoDataAlert, ProgressAlert} from '../widgets/ChartAlert';
import * as magnetopauseActions from '../../actions/magnetopause';


class MagnetopauseDashboard extends Component {
  componentWillMount = () => {
    this.props.magnetopauseActions.calculateMagnetopause();
  };

  render = () => {
    const {isLoading, isError, isEmpty, progress} = this.props;
    if (isLoading || isError) {
      return (<ProgressAlert
        text={progress.title}
        percent={progress.value}
        error={isError}
        onContextMenu={this.handlerContextMenu}
      />);
    }

    if (!isEmpty) {
      return (
        <div className={`magnetopause-view`}>
          <ResizeblePanel type="vertical" eventWhen="mouseup" defaultSize={24}>
            <Panel>
              <MagnetopauseChart/>
            </Panel>
            <Panel>
              <MagnetopauseMap/>
            </Panel>
          </ResizeblePanel>
        </div>
      );
    }

    return (<NoDataAlert/>);
  }
}

function mapStateToProps(state) {
  return {
    isEmpty: state.magnetopause.chart == null,
    isLoading: state.dataSet.isLoading,
    isError: state.dataSet.isError,
    progress: state.dataSet.progress,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    magnetopauseActions: bindActionCreators(magnetopauseActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MagnetopauseDashboard);
