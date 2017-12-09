// @flow
import React, {Component} from 'react';
import {ResizeblePanel, Panel} from '../widgets/ResizeblePanel';
import Hav from '../graphics/Hav';
import DataSet from './DataSetChart';
import VectorMap from '../map/VectorMapChart';


export default class Main extends Component {

  render()  {
    // return (
    //   <div className="container-flux">
    //     <OtherParam></OtherParam>
    //   </div>
    // );

    console.log(this.props.main);

    return (
      <ResizeblePanel type="horizontal" eventWhen="mouseup">
        <Panel className="test">
          <Hav></Hav>
        </Panel>
        <Panel>
          <ResizeblePanel type="vertical" eventWhen="mouseup" defaultSize={24}>
            <Panel>
              <DataSet></DataSet>
            </Panel>
            <Panel>
              <VectorMap name={this.props.main.name}></VectorMap>
            </Panel>
          </ResizeblePanel>
        </Panel>
      </ResizeblePanel>
    );
  }
}
