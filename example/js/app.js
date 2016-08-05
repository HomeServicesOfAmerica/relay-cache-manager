import 'babel-polyfill';

import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import CacheManager from 'relay-cache-manager';

const cacheManager = new CacheManager();

Relay.Store.getStoreData().injectCacheManager(cacheManager);


ReactDOM.render(
  <Relay.Renderer
    environment={Relay.Store}
    Container={App}
    queryConfig={new AppHomeRoute()}
  />,
  document.getElementById('root')
);
