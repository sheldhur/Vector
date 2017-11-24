import React, {Component} from 'react'
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ResizeblePanel, Panel} from './../widgets/ResizeblePanel';
import MagnetopauseMap from './MagnetopauseMap';
import MagnetopauseChart from './MagnetopauseChart';
import {NoDataAlert} from './../widgets/ChartAlert';
import * as MagnetopauseActions from './../../actions/magnetopause';


class MagnetopauseDashboard extends Component {
  componentWillMount = () => {
    this.props.magnetopauseActions.calculateMagnetopause();
  };

  // componentWillReceiveProps = (nextProps) => {
  //   if (JSON.stringify(nextProps.settings.project.magnetopause) !== JSON.stringify(this.props.settings.project.magnetopause)) {
  //     // this.props.magnetopauseActions.prepareDataSet();
  //   }
  // };

  render = () => {
    if (this.props.data != null) {
      return (
        <div className={`magnetopause-view`}>
          <ResizeblePanel type="vertical" eventWhen="mouseup" defaultSize={24}>
            <Panel>
              <MagnetopauseChart antiAliasing={this.props.antiAliasing} chart={this.props.chart}/>
            </Panel>
            <Panel>
              <MagnetopauseMap antiAliasing={this.props.antiAliasing} data={this.props.data}/>
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
    chart: state.magnetopause.chart,
    data: state.magnetopause.data,
    antiAliasing: state.main.settings.app.antiAliasing,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    magnetopauseActions: bindActionCreators(MagnetopauseActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MagnetopauseDashboard);
