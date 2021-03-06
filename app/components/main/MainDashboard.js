// @flow
import React, { Component } from 'react';
import { ResizeblePanel, Panel } from '../widgets/ResizeblePanel';
import StationAvgChart from '../stationsAvg/StationAvgChart';
import DataSetChart from '../dataSet/DataSetsChart';
import VectorMapChart from '../map/VectorMapChart';


class MainDashboard extends Component {
  render = () => (
    <ResizeblePanel type="horizontal" eventWhen="mouseup" defaultSize={80}>
      <Panel>
        <ResizeblePanel type="vertical" eventWhen="mouseup" defaultSize={24}>
          <Panel>
            <DataSetChart getStations />
          </Panel>
          <Panel>
            <VectorMapChart />
          </Panel>
        </ResizeblePanel>
      </Panel>
      <Panel>
        <StationAvgChart />
      </Panel>
    </ResizeblePanel>
  )
}

export default MainDashboard;
