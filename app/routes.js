// @flow
import React from 'react';
import { Route, IndexRoute, browserHistory} from 'react-router';
import App from './containers/App';
import Home from './components/Home';
import Main from './components/main/Main';
import DataSetView from './components/dataSet/DataSetView';
import DataSetValuesView from './components/dataSet/DataSetValuesView';
import StationsView from './components/stations/StationsView';
import StationValuesView from './components/stations/StationValuesView';
import Capture from './components/capture/Capture';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="/home" component={Home} />
    <Route path="/main" component={Main} />
    <Route path="/dataSet" component={DataSetView} />
    <Route path="/dataSet/:id" component={DataSetValuesView} />
    <Route path="/station" component={StationsView} />
    <Route path="/station/:id" component={StationValuesView} />
    <Route path="/capture" component={Capture} />
  </Route>
);

