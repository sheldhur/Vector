import React, {Component} from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MainHeaderControls from '../main/MainHeaderControls';
import MainHeaderCapture from '../main/MainHeaderCapture';
import MagnetopauseSettings from './MagnetopauseSettings';
import MagnetopauseSettingsChart from './MagnetopauseSettingsChart';

class MagnetopauseHeader extends Component {
  size = 'small';

  render = () => {
    const {field} = this.props;
    const modalVisible = !(field && field.b && field.bz && field.pressureSolar);
    return (
      <div className="main-page-header">
        <MagnetopauseSettings size={this.size} modalVisible={modalVisible}/>
        <MagnetopauseSettingsChart size={this.size}/>
        <MainHeaderControls size={this.size}/>
        <MainHeaderCapture size={this.size}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    field: state.main.settings.projectMagnetopause,
  };
}

export default connect(mapStateToProps, null)(MagnetopauseHeader);
