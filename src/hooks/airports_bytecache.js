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
    console.log('tries: ' + tries);
    try {
      var [text, contentLength] = await fetchAirportJson(offset, offset + length - 1);
      offset += length;
      string += text;
      [airport, begin, end] = getAirport(string, nominalOffset);
    } catch (e) {
      console.log(e);
    }
  }

  var objectLength = end - begin;

  return [contentLength, objectLength, airport];
}

/// databuffer is keyed by url
var dataBuffer = {};

async function fetchContentLength(url) {
  var contentLength = 0;
  var response = await fetch(url, { method: 'HEAD' });
  response.headers.forEach(header => {
    if (!isNaN(parseInt(header))) {
      contentLength = parseInt(header);
    }
  });
  return contentLength;
}

async function cachedFetchRange(url, begin, end) {
  /// iterate through databuffer to find the contiguous
  /// ranges to fetch

  if (typeof dataBuffer[url] === 'undefined') {
    dataBuffer[url] = new ArrayBuffer(await fetchContentLength(url));
  }

  /// find byte ranges that we need to fetch
  var view = new Uint8Array(dataBuffer[url], begin, end - begin + 1);

  /// range { begin , end }
  var ranges = [];

  var rangeIndex = 0;
  for (var i = 0; i < view.length; i++) {
    if (view[i] == 0) {
      /// no data is availble here so we begin should already be set
      /// if its not we should set it. if begin is already set we
      /// don't need to do anything
      if (ranges[rangeIndex] == null) {
        ranges[rangeIndex] = { begin: i + begin };
      } else {
        ranges[rangeIndex].end = i + begin;
      }
    }
    else {
      /// increment rangeIndex if we already have a range
      if (ranges[rangeIndex] != null) {
        rangeIndex++;
      }
    }
  }

  /// we have all the data in the buffer so return without fetching
  if(ranges.length == 0) {
    return [String.fromCharCode.apply(null, view), dataBuffer[url].byteLength];
  }

  var rangeHeaderValue = 'bytes=' + ranges.map(range => `${range.begin}-${range.end}`).join(', ');

  print(rangeHeaderValue);

  /// "Range: bytes=0-50, 100-150"
  try {

    var buffer = await fetch(url, {
      'headers': {
        'Range': rangeHeaderValue
      }
    }).then(response => response.arrayBuffer());

    var bytes = new Uint8Array(buffer);

    ranges.forEach((range) => {
      var writer = new Uint8Array(dataBuffer[url], range.begin, range.end - range.begin + 1);
      for(var i = 0; i < writer.length; i++) {
        writer[i] = bytes[i];
      }
    });

    // buffer might have been written somewhere else so read buffer again
    var view = new Uint8Array(dataBuffer[url], begin, end - begin + 1);
    var text = String.fromCharCode.apply(null, view);
    return [text, dataBuffer[url].byteLength];

  } catch (e) {
    console.log(e);
  }

  return [String.fromCharCode.apply(null, view), dataBuffer[url].byteLength];
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

  var begin = offset * objectLength;
  var end = begin + items * objectLength;
  var string = '';
  var [text] = await fetchAirportJson(begin, end);

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
      print(text.substr(indices[i]))
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
