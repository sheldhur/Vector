/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Route, Switch } from 'react-router';
import App from './containers/App';
import Home from './components/Home';
import Main from './components/main/Main';
import DataSetsView from './components/dataSet/DataSetsView';
import DataSetValuesView from './components/dataSet/DataSetValuesView';
import StationsView from './components/stations/StationsView';
import StationValuesView from './components/stations/StationValuesView';
import Capture from './components/capture/Capture';
import MagnetopauseView from './components/magnetopause/MagnetopauseView';


export default () => (
  <App>
    <Switch>
      <Route path="/home" component={Home} />
      <Route path="/main" component={Main} />
      <Route path="/dataSet/:id" component={DataSetValuesView} />
      <Route path="/dataSet" component={DataSetsView} />
      <Route path="/station/:id" component={StationValuesView} />
      <Route path="/station" component={StationsView} />
      <Route path="/capture" component={Capture} />
      <Route path="/magnetopause" component={MagnetopauseView} />
      <Route path="/" component={Home} />
    </Switch>
  </App>
);
