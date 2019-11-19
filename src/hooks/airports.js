import { useState, useEffect } from 'react';

/// set up the list view to full height
/// use scroll offset to interpolate cursor
/// position. assume objects are approx equal length
/// one improvement is the server should send the
/// index of the object in the overall list

const print = console.log;

function useAirports(ref) {

  const rowHeight = 100;

  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [position, setPosition] = useState(0);
  const [dataBuffer, setDataBuffer] = useState(new ArrayBuffer(0));



  var airports = [];
  var numberOfAirports = 0;
  var pages = 0;
  var bytesPerAirport = 0;


  // var cursor = 0;

  if (dataBuffer.byteLength > 0) {

    try {
      var uniqueKey = 'airportCode';
      var view = new Uint8Array(dataBuffer, cursor, fetchBytes);
      var text = String.fromCharCode.apply(null, view);

      var indices = getIndicesOf(uniqueKey, text);
      airports = indices.map(i => getAirport(text, i)).filter(value => value != null);
      bytesPerAirport = fetchBytes / airports.length;
      // debugger;
      numberOfAirports = dataBuffer.byteLength / bytesPerAirport;
      pages = dataBuffer.byteLength / fetchBytes;
      // console.log('bytes per airport ' + bytesPerAirport);
      // console.log(numberOfAirports);
      // console.log(pages);
    } catch (e) {
      console.log(e);
      print(dataBuffer);
      print(cursor);
      print(fetchBytes);
    }
  }

  useEffect(() => {

    /// init this
    var onScroll = handleScroll(ref, airports, setIsLoading, dataBuffer, setDataBuffer, cursor, setCursor, numberOfAirports, bytesPerAirport);

    /// run once manually, scroll events will trigger it later
    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => {
      // do cleanup here if needed
      window.removeEventListener('scroll', onScroll);
    }
  },
    // update when airports is updated
    [cursor, dataBuffer]);

  return [airports, isLoading, numberOfAirports, pages];
}

const listItemHeight = 100;

const fetchThreshold = 3;

/// set up a nominal amount to fetch
//  e.g. 'Range', 'bytes=100-200'
const fetchBytes = 5000;

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

    } catch(e) {
      alert(data.substring(begin, end + 1));
    }
    return airport;
  }

  return null;
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

/// current position of byte offset range fetch
// var cursor = 0;

/// appendAirports is the setdata function
function handleScroll(ref, airports, setIsLoading, dataBuffer, setDataBuffer, cursor, setCursor, numberOfAirports, bytesPerAirport) {
  return async () => {
    var bounding = ref.current.getBoundingClientRect()
    var seen = window.innerHeight - bounding.top;

    // print(JSON.stringify(bounding, null, 2));

    var offset = Math.floor(-bounding.top / 100);

    var byteCursor = 0;

    // initally we don't have the dataBuffer
    // length so just hardcode byteCursor to 1000
    // to kick things off
    if (offset > 0) {
      byteCursor = Math.floor(numberOfAirports / offset);
    }


    // print('byteCursor ' + byteCursor);
    // print('offset ' + offset);
    // print('numberOfAirports ' + numberOfAirports);


    // if (airports.length < 10) {
    //   await fetchAirports(setIsLoading, dataBuffer, setDataBuffer, cursor, setCursor);
    // }
    // if (seen > (bounding.height - listItemHeight * fetchThreshold)) {
    await fetchAirports(setIsLoading, dataBuffer, setDataBuffer, byteCursor);
    setCursor(byteCursor);
    // }
  }
}

async function fetchAirports(setIsLoading, dataBuffer, setDataBuffer, cursor) {
  setIsLoading(true);
  await fetchData(cursor, cursor + fetchBytes - 1, dataBuffer, setDataBuffer);
  setIsLoading(false);
  // debugger;

  /// update cursor
  // cursor += fetchBytes;


  // appendAirports(fetchedAirports);
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

/// keep a global buffer so when we fetch range
/// of the file we can put it in the correct place
/// assume ASCII text
// window.dataBuffer = null;

// class Controller {
//   static sharedInstance = Controller.sharedInstance == null ? new Controller() : this.sharedInstance

//   constructor() {

//     /// initialise the databuffer
//     this.dataBuffer = null;

//   }

//   printHelloWorld() {
//       console.log("\n\tHello World... \(^_^)/ !!")
//   }
// }
// debugger

/// simple function to fetch a data range
/// return a promise that return data
async function fetchData(begin, end, dataBuffer, setDataBuffer, ) {
  try {
    var response = await fetch('/airport.json', {
      'headers': {
        'Range': `bytes=${begin}-${end}`
      }
    });
    var contentLength;

    // var text = await response.text();
    response.headers.forEach(header => {
      var _contentLength = getContentLength(header);
      if (_contentLength != null) {
        contentLength = _contentLength;
      }
    });

    var buffer = await response.arrayBuffer();
    // debugger;

    var newDataBuffer = dataBuffer.byteLength == 0 ? new ArrayBuffer(contentLength) : dataBuffer;

    var sourceView = new Uint8Array(buffer);

    var targetView = new Uint8Array(newDataBuffer, begin, sourceView.length);
    for (var i = begin; i < sourceView.length; i++) {
      targetView[i] = sourceView[i];
    }
    // debugger;
    setDataBuffer(newDataBuffer);

    // print(targetView);

    // debugger;


    // debugger;
    // // buffer.copy(dataBuffer, begin);
    // // debugger;
    // // var dataBuffer = new ArrayBuffer(contentLength);
    // var view1 = new DataView(dataBuffer);
    // view1.setUint8(begin, end);
    // // console.log(ab2str(dataBuffer));

    // debugger;
    // debugger;
    // var text = await response.text();
    return String.fromCharCode.apply(null, sourceView);

  } catch (e) {
    console.log(e);

    // debugger;
  }
  return ''
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/// store the airports here keyed by
/// airport code. would use redux in a real application
// var airportsMap = {};

// var tries = 0;

export { getAirport, getIndicesOf, getContentLength, useAirports };
