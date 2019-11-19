import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import AirportsScreen, { DetailScreen } from './screens/airports_screen';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/airport/:airportCode" component={(props) => <DetailScreen {...props} />} />
        <Route path="/" >
          <AirportsScreen />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
