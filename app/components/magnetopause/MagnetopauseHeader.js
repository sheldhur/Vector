import React, {Component} from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MainHeaderControls from './../main/MainHeaderControls';
import MainHeaderCapture from './../main/MainHeaderCapture';
import MagnetopauseSettings from './MagnetopauseSettings';

class MagnetopauseHeader extends Component {
  size = 'small';

  render = () => {
    const field = this.props.settings.project.magnetopause;
    const modalVisible = !(field && field.b && field.bz && field.pressureSolar);
    console.log({modalVisible, field});
    return (
      <div className="main-page-header">
        <MagnetopauseSettings size={this.size} modalVisible={modalVisible}/>
        <MainHeaderControls size={this.size}/>
        <MainHeaderCapture size={this.size}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    settings: state.main.settings,
  };
}

export default connect(mapStateToProps, null)(MagnetopauseHeader);
