import React, { useEffect, useState, useRef } from 'react';

import { Link, Redirect } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Paper, Typography, Button } from '@material-ui/core';

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

/// create a function that download byte range
/// get the airport object and add to airports map

/// we have to know the listview height in advance so we can
/// calculate heights.
var listItemHeight = 100;

var fetchThreshold = 3;

/// set up a nominal amount to fetch
//  e.g. 'Range', 'bytes=100-200'
var fetchBytes = 10000;

/// to get an airport object we look for "airportCode" offset
/// then we count curly braces before and after to get the object
/// if we can't find the opening or closing brace we return null
var uniqueKey = 'airportCode';

/// get the json object that contains the offset
/// return null if no object found
/// should write a test for this
function getAirport(data, offset) {

  var begin, end;

  /// count brackets going forward to find the closing bracket
  /// when forwardCount goes negative we have found the closing
  /// bracket
  var forwardCount = 0;

  /// count brackets going backwards to find the opening bracket
  /// when backwardCount goes positive we have found the opening
  /// bracket
  var backwardCount = 0;

  for (var i = offset; i < data.length; i++) {
    if (data[i] == '{') forwardCount++;
    if (data[i] == '}') forwardCount--;
    if (forwardCount < 0) {
      end = i;
      break;
    }
  }

  for (var i = offset; i >= 0; i--) {
    if (data[i] == '{') backwardCount++;
    if (data[i] == '}') backwardCount--;
    if (backwardCount > 0) {
      begin = i;
      break;
    }
  }

  /// store the airport in global airportsMap
  /// return the airport if found
  if (begin != null && end != null) {
    var airport = JSON.parse(data.substring(begin, end + 1));
    airportsMap[airport.airportCode] = airport;
    return airport;
  }
}

/// found this on stack overflow
/// should write a test for this
function getIndicesOf(searchStr, str, caseSensitive = false) {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0, index, indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}

/// current position of byte offset range fetch
var cursor = 0;

/// appendAirports is the setdata function
function handleScroll(ref, airports, appendAirports, setIsLoading) {
  return () => {
    var bounding = ref.current.getBoundingClientRect()
    var seen = window.innerHeight - bounding.top;

    if (airports.length < 10) {
      fetchAirports(appendAirports, setIsLoading);
    }
    if (seen > (bounding.height - listItemHeight * fetchThreshold)) {
      fetchAirports(appendAirports, setIsLoading);
    }
  }
}

async function fetchAirports(appendAirports, setIsLoading) {
  setIsLoading(true);
  var data = await fetchData(cursor, cursor + fetchBytes);
  setIsLoading(false);

  /// update cursor
  cursor += fetchBytes;

  var indices = getIndicesOf(uniqueKey, data);
  var fetchedAirports = indices.map(i => getAirport(data, i)).filter(value => value != null);

  appendAirports(fetchedAirports);
}


/// simple function to fetch a data range
/// return a promise that return data
function fetchData(begin, end) {
  return fetch('/airport.json', {
    'headers': {
      'Range': `bytes=${begin}-${end}`
    }
  })
    .then(response => response.text());
}

/// store the airports here keyed by
/// airport code. would use redux in a real application
var airportsMap = {};

function AirportsScreen() {

  const classes = useStyles();
  const [airports, setAirports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const listViewRef = useRef(null);

  function appendAirports(list) {
    setAirports([...airports, ...list]);
  }

  useEffect(() => {
    /// init this
    var onScroll;

    // need to wrap async
    (
      async () => {
        onScroll = handleScroll(listViewRef, airports, appendAirports, setIsLoading);

        /// run this once
        onScroll();
        window.addEventListener('scroll', onScroll);
      }
    )();

    return () => {
      // do cleanup here if needed
      window.removeEventListener('scroll', onScroll);
    }
  },
    // update when airports is updated
    [airports]);

  return <Paper ref={listViewRef} className={classes.root}>
    <Typography className={classes.title} variant="h5" component="h3">
      Airports
  </Typography>
    <List component="nav" aria-label="main mailbox folders">
      {airports.map(airport => <AirportRow {...airport} />)}
    </List>
    <div className={isLoading ? classes.centered : classes.centeredHide}>
      <CircularProgress disableShrink />
    </div>
  </Paper>
}

function AirportRow({ airportCode, airportName, }) {
  const classes = useStyles();
  const link = React.forwardRef((props, ref) => <Link to={`airport/${airportCode}`} innerRef={ref} {...props} />);

  return <ListItem component={link} className={classes.listItem} button>
    <ListItemText primary={`${airportCode} ${airportName}`} />
  </ListItem>;
}

function DetailScreen({ match: { params: { airportCode } } }) {
  const classes = useStyles();
  const back = React.forwardRef((props, ref) => <Link to="/" innerRef={ref} {...props} />);
  const airport = airportsMap[airportCode];

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


  return airport == null
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
