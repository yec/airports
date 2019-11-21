import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { setAirports } from '../actions/airportsActions';

import debounce from 'debounce';

/// set up the list view to full height
/// use scroll offset to interpolate cursor
/// position. assume objects are approx equal length
/// one improvement is the server should send the
/// index of the object in the overall list

const print = console.log;

async function calibrateFetch() {

  var offset = 0;
  var length = 50;
  var airport = null;
  var begin = 0;
  var end = 0;
  var string = '';
  var nominalOffset = 5; /// this is probably in an airport object
  var tries = 0;
  var text;
  var contentLength;

  while (airport === null && tries < 50) {
    tries++;
    var [text, contentLength] = await fetchAirportJson(offset, offset + length - 1);
    offset += length;
    string += text;
    [airport, begin, end] = getAirport(string, nominalOffset);
  }

  var objectLength = end - begin;

  return [contentLength, objectLength, airport];
}

var promises = {};

const promiseKey = (url, begin, end) => `${url}-${begin}-${end}`;

async function cachedFetchRange(url, begin, end) {
  var cacheKey = promiseKey(url, begin, end);

  if(typeof promises[cacheKey] !== 'undefined') {
    return promises[cacheKey];
  }

  var p = new Promise(function(resolve, reject) {
    fetch(url, {
      'headers': {
        'Range': `bytes=${begin}-${end}`
      }
    }).then(async (response) => {
      var text = await response.text();
      var contentLength;
      response.headers.forEach(header => {
        var _contentLength = getContentLength(header);
        if (_contentLength != null) {
          contentLength = _contentLength;
        }
      });
      resolve([text, contentLength]);
    }).catch((e) => {
      delete promises[cacheKey];
      reject(e);
    })
  });

  promises[cacheKey] = p;
  return p;
}

async function fetchAirportJson(begin, end) {
  try {
    var [text, contentLength] = await cachedFetchRange('/airport.json', begin, end);
    return [text, contentLength];
  } catch (e) {
    print(e);
  }
}

function useAirports(ref) {

  const rowHeight = 100;

  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [numberOfAirports, setNumberOfAirports] = useState(0);
  const [position, setPosition] = useState(0);
  const [dataBuffer, setDataBuffer] = useState(new ArrayBuffer(0));
  const dispatch = useDispatch();

  const { airports } = useSelector(state => ({
    airports: state.airports,
  }));

  // var airports = {};
  // var numberOfAirports = 0;
  var pages = 0;
  var bytesPerAirport = 0;

  // var bytesPerAirport = fetchBytes / indices.length;

  const [contentLength, setContentLenth] = useState(0);
  const [objectLength, setObjectLength] = useState(0);

  useEffect(() => {

    /// init this
    var onScroll;

    (async () => {

      var [contentLength, objectLength, airport] = await calibrateFetch();

      setContentLenth(contentLength);
      setObjectLength(objectLength);

      var bounced = handleScroll(ref, airports, setIsLoading, dataBuffer, setDataBuffer, cursor, setCursor, dispatch, bytesPerAirport, contentLength, objectLength);
      onScroll = debounce(bounced, 10);

      /// run once manually, scroll events will trigger it later
      onScroll();
      window.addEventListener('scroll', onScroll);

    })();
    return () => {
      // do cleanup here if needed
      window.removeEventListener('scroll', onScroll);
    }
  },
    // update when airports is updated
    []);


  return [airports.visible, isLoading, numberOfAirports, pages, contentLength, objectLength];
}

const listItemHeight = 100;

/// set up a nominal amount to fetch
//  e.g. 'Range', 'bytes=100-200'

/// to get an airport object we look for "airportCode" offset
/// then we count curly braces before and after to get the object
/// if we can't find the opening or closing brace we return null
const uniqueKey = 'airportCode';

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
    if (data[i] === '{') forwardCount++;
    if (data[i] === '}') forwardCount--;
    if (forwardCount < 0) {
      end = i;
      break;
    }
  }

  for (var i = offset; i >= 0; i--) {
    if (data[i] === '{') backwardCount++;
    if (data[i] === '}') backwardCount--;
    if (backwardCount > 0) {
      begin = i;
      break;
    }
  }

  /// store the airport in global airportsMap
  /// return the airport if found or null if no
  /// airport found
  if (begin != null && end != null) {

    try {
      var airport = JSON.parse(data.substring(begin, end + 1));
      return [airport, begin, end];
    } catch (e) {
      console.log('couldnt parse airport');
    }
  }

  return [null, begin, end];
}

/// found this on stack overflow
/// should write a test for this
function getIndicesOf(searchStr, str, caseSensitive = false) {
  var searchStrLen = searchStr.length;
  if (searchStrLen === 0) {
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

var dataBuffer = new ArrayBuffer(0);

async function fetchAirportRange(offset, items, objectLength, airports) {

  var promises = [];
  /// lets segment to improve efficiency
  for(var i=0; i < items; i++) {
    var begin = (offset + i) * objectLength;
    var end = begin + objectLength - 1;

    /// don't await here. we want the promise object
    promises[i] = fetchAirportJson(begin, end)
  }

  var result = await Promise.all(promises);
  var text = result.map(([text]) => text).join(''); /// the default joiner is , so need to set to empty
  var indices = getIndicesOf('airportCode', text);

  var airports = {};

  for (var i = 0; i < indices.length; i++) {

    var airport, begin, end;
    if (airports.range && airports.range[offset + i] != null) {
      airport = airports.range[ "" + (offset + i)];
    } else {
      [airport, begin, end] = getAirport(text, indices[i]);
    }

    if (airport != null) {
      airport.delta = offset + i;
      airports[airport.airportCode] = airport;
    } else {
      print(`couldn't parse airport at ${indices[i]}`);
      print(text.substr( Math.max(0,indices[i]), indices[i+1]))
    }
  }

  return airports;
}


function handleScroll(ref, airports, setIsLoading, dataBuffer, setDataBuffer, cursor, setCursor, dispatch, bytesPerAirport, contentLength, objectLength) {
  return async () => {
    var bounding = ref.current.getBoundingClientRect()
    var offset = Math.floor(-bounding.top / 100);
    var items = Math.ceil(window.innerHeight / 100);
    setIsLoading(true);
    var airports = await fetchAirportRange(Math.max(offset, 0), items + 3, objectLength, airports);
    dispatch(setAirports(airports));
    setIsLoading(false);
  }
}

function getContentLength(header) {
  if (header.indexOf('bytes') === 0) {
    /// bytes header looks like this
    /// bytes 0-5000/3809746
    if (header.indexOf('/') > 0) {
      var contentLength = header.substr(header.indexOf('/') + 1);
      return parseInt(contentLength);
    }
  }
  return null;
}

export { getAirport, getIndicesOf, getContentLength, useAirports };
