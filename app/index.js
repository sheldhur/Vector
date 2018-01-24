import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { LocaleProvider } from 'antd';
import locale from 'antd/lib/locale-provider/ru_RU';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import initServices from './services';
import './app.global.less';
import './app.global.css';

const store = configureStore();
initServices(store, history);

render(
  <LocaleProvider locale={locale}>
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>
  </LocaleProvider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <LocaleProvider locale={locale}>
        <AppContainer>
          <NextRoot store={store} history={history} />
        </AppContainer>
      </LocaleProvider>,
      document.getElementById('root')
    );
  });
}
