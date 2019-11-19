import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAirports } from '../hooks/airports';

import { Link, Redirect } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Paper, Typography, Button } from '@material-ui/core';

const print = console.log;

const useStyles = makeStyles(theme => ({
  listItem: {
    height: listItemHeight,
  },
  title: {
    padding: 40,
  },
  body: {
    padding: 40,
  },
  root: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    maxWidth: 560,
    backgroundColor: theme.palette.background.paper,
  },
  centered: {
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  centeredHide: {
    transition: 'opacity 0.2s',
    opacity: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

const listItemHeight = 100;


function AirportsScreen() {

  const classes = useStyles();

  const listViewRef = useRef(null);

  var [airports, isLoading, numberOfAirports, pages, contentLength, objectLength] = useAirports(listViewRef);


  if (listViewRef.current != null) {
    var height = (contentLength != 0 && objectLength != 0)
      ? Math.round(contentLength/objectLength) * 100
      : 1000;
    listViewRef.current.style = `height: ${height}px`;
  }

  return <Paper className={classes.root}>
    <Typography className={classes.title} variant="h5" component="h3">
      Airports approx {Math.round(contentLength/objectLength)}
  </Typography>
    <List ref={listViewRef} component="nav" aria-label="airports">
      {Object.values(airports).map((airport, index) => <AirportRow key={airport.airportCode} {...airport} />)}
    </List>
  </Paper>
}

function AirportRow({ airportCode, airportName, delta }) {
  const classes = useStyles();
  const link = React.forwardRef((props, ref) => <Link to={`airport/${airportCode}`} innerRef={ref} {...props} />);
  const listItemRef = useRef(null);

  const text = airportCode === null ? '' : `${airportCode} - ${airportName}` ;

  // print('hello');
  /// initially load airport rows with no data
  /// then when the airport dareta is ready we can show the airport
  return <ListItem ref={listItemRef} style={{position: 'absolute', top: delta * 100 }} component={link} className={classes.listItem} button>
    <ListItemText className={classes.noData} primary={text} />
  </ListItem>;
}

function DetailScreen({ match: { params: { airportCode } } }) {
  const { airports } = useSelector(state => ({
    airports: state.airports.all,
  }));

  const classes = useStyles();
  const back = React.forwardRef((props, ref) => <Link to="/" innerRef={ref} {...props} />);
  const airport = airports[airportCode];

  /// airport object for reference
  ///
  // var airport =
  // {
  //   "airportCode": "AAA",
  //   "internationalAirport": false,
  //   "domesticAirport": false,
  //   "regionalAirport": false,
  //   "onlineIndicator": false,
  //   "eticketableAirport": false,
  //   "location": {
  //     "aboveSeaLevel": -99999,
  //     "latitude": 17.25,
  //     "latitudeRadius": -0.304,
  //     "longitude": 145.3,
  //     "longitudeRadius": -2.5395,
  //     "latitudeDirection": "S",
  //     "longitudeDirection": "W"
  //   },
  //   "airportName": "Anaa",
  //   "city": {
  //     "cityCode": "AAA",
  //     "cityName": "Anaa",
  //     "timeZoneName": "Pacific/Tahiti"
  //   },
  //   "country": {
  //     "countryCode": "PF",
  //     "countryName": "French Polynesia"
  //   },
  //   "region": {
  //     "regionCode": "SP",
  //     "regionName": "South Pacific"
  //   }
  // }

  return airport === null
    ? <Redirect to="/" />
    : <Paper className={classes.root}>
      <Typography className={classes.title} variant="h5" component="h3">
        {`${airport.airportCode} - ${airport.airportName}`}
      </Typography>
      <Divider />
      <div className={classes.body} >
        <Typography component="p">
          International airport: {`${airport.internationalAirport}`}
        </Typography>
        <Typography component="p">
          Domestic airport: {`${airport.domesticAirport}`}
        </Typography>
        <Typography component="p">
          Regional airport: {`${airport.regionalAirport}`}
        </Typography>
        <Typography component="p">
          Online indicator: {`${airport.onlineIndicator}`}
        </Typography>
        <Typography component="p">
          Eticketable airport: {`${airport.eticketableAirport}`}
        </Typography>
      </div>
      <Divider />
      <div className={classes.body} >
        <Typography component="p">
          Above sea level: {`${airport.location.aboveSeaLevel}`} feet
    </Typography>
        <Typography component="p">
          Latitude: {`${airport.location.latitude} ${airport.location.latitudeRadius}`}
        </Typography>
        <Typography component="p">
          Longitude: {`${airport.location.longitude} ${airport.location.longitudeRadius}`}
        </Typography>
        <Typography component="p">
          Direction: {`${airport.location.latitudeDirection}${airport.location.longitudeDirection}`}
        </Typography>
      </div>
      <Divider />
      <div className={classes.body} >
        <Typography component="p">
          City: {`${airport.city.cityCode} ${airport.city.cityName} ${airport.city.timeZoneName}`}
        </Typography>
        <Typography component="p">
          Country: {`${airport.country.countryCode} ${airport.country.countryName}`}
        </Typography>
        <Typography component="p">
          Region: {`${airport.region.regionCode} ${airport.region.regionName}`}
        </Typography>
      </div>
      <Divider />
      <div className={classes.body} >
        <Button variant="contained" component={back} >
          Back
      </Button>
      </div>
    </Paper>
}

export { DetailScreen };

export default AirportsScreen;
