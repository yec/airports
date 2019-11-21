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

const store = configureStore();

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/airport/:airportCode" component={(props) => <DetailScreen {...props} />} />
          <Route path="/" >
            <HomeScreen />
          </Route>
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
