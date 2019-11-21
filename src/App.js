import React from 'react';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import configureStore from './store/configureStore';

import AirportsScreen, { DetailScreen } from './screens/airports_screen';
import HomeScreen from './screens/home_screen';

import { useAirports as useAirportsNoCache } from './hooks/airports_nocache';
import { useAirports as useAirportsArrayBuffer } from './hooks/airports_bytecache';
import { useAirports as useAirportsPromise } from './hooks/airports_segment';

const store = configureStore();

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/airport/:airportCode" component={(props) => <DetailScreen {...props} />} />
          <Route path="/nocache">
            <AirportsScreen useAirports={useAirportsNoCache} />
          </Route>
          <Route path="/promise">
            <AirportsScreen useAirports={useAirportsPromise} />
          </Route>
          <Route path="/arraybuffer">
            <AirportsScreen useAirports={useAirportsArrayBuffer} />
          </Route>
          <Route path="/">
            <HomeScreen />
          </Route>
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
