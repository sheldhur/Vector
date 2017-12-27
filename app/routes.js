/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import {Switch, Route} from 'react-router';
import App from './containers/App';
import Home from './components/Home';
import Main from './components/main/Main';
import DataSetsView from './components/dataSet/DataSetsView';
import DataSetValuesView from './components/dataSet/DataSetValuesView';
import StationsView from './components/stations/StationsView';
import StationValuesView from './components/stations/StationValuesView';
import Capture from './components/capture/Capture';
import MagnetopauseView from './components/magnetopause/MagnetopauseView';
import _SettingsFormat from './components/_SettingsFormat';

export default () => (
  <App>
    <Switch>
      <Route path="/home" component={Home}/>
      <Route path="/main" component={Main}/>
      <Route path="/dataSet/:id" component={DataSetValuesView}/>
      <Route path="/dataSet" component={DataSetsView}/>
      <Route path="/station/:id" component={StationValuesView}/>
      <Route path="/station" component={StationsView}/>
      <Route path="/capture" component={Capture}/>
      <Route path="/magnetopause" component={MagnetopauseView}/>
      <Route path="/test" component={_SettingsFormat}/>
      <Route path="/" component={Home}/>
    </Switch>
  </App>
);
