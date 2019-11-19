import {getIndicesOf, getAirport, getContentLength} from '../hooks/airports.js';

describe('Test data functions', () => {
  it('getIndicesOf returns all matching of searchString in text.', () => {
    var indices = getIndicesOf('airportCode', text);
    expect(indices).toEqual(expectedIndices);
  });

  it('getIndicesOf returns empty array if no searchString found in text.', () => {
    var indices = getIndicesOf('airportCode', 'rnationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIn');
    expect(indices).toEqual([]);
  });

  it('getAirport returns the airport object that contains offset.', () => {
    var airport = getAirport(text, 505);
    expect(airport).toEqual(expectedAirport);
  });


  it('getAirport returns null if beginning bracket not found.', () => {
    var airport = getAirport(text, 5);
    expect(airport).toBeNull();
  });

  it('getAirport returns null if end bracket not found.', () => {
    var airport = getAirport(text, 4758);
    expect(airport).toBeNull();
  });


  it('getContentLength returns content length from header.', () => {
    var contentLength = getContentLength('bytes 0-5000/3809746');
    expect(contentLength).toEqual(3809746);
  });


  it('getContentLength returns content length from header.', () => {
    var contentLength = getContentLength('bytes 0-50003809746');
    expect(contentLength).toBeNull();
  });

});


var text = `rnationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":true,"eticketableAirport":false,"location":{"aboveSeaLevel":1000,"latitude":53.43,"latitudeRadius":0.9375,"longitude":91.25,"longitudeRadius":1.5955,"latitudeDirection":"N","longitudeDirection":"E"},"airportName":"Abakan","city":{"cityCode":"ABA","cityName":"Abakan","timeZoneName":"Asia/Krasnoyarsk"},"country":{"countryCode":"RU","countryName":"Russian Fed"},"region":{"regionCode":"EU","regionName":"Europe"}},{"airportCode":"ABC","internationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":true,"eticketableAirport":false,"location":{"aboveSeaLevel":2221,"latitude":38.58,"latitudeRadius":0.6801,"longitude":1.51,"longitudeRadius":-0.0323,"latitudeDirection":"N","longitudeDirection":"W"},"airportName":"Albacete","city":{"cityCode":"ABC","cityName":"Albacete","timeZoneName":"Europe/Madrid"},"country":{"countryCode":"ES","countryName":"Spain"},"region":{"regionCode":"EU","regionName":"Europe"}},{"airportCode":"ABD","internationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":false,"eticketableAirport":false,"location":{"aboveSeaLevel":10,"latitude":30.22,"latitudeRadius":0.5300,"longitude":48.14,"longitudeRadius":0.8418,"latitudeDirection":"N","longitudeDirection":"E"},"airportName":"Abadan","city":{"cityCode":"ABD","cityName":"Abadan","timeZoneName":"Asia/Tehran"},"country":{"countryCode":"IR","countryName":"Iran"},"region":{"regionCode":"ME","regionName":"Middle East"}},{"airportCode":"ABE","internationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":true,"eticketableAirport":false,"location":{"aboveSeaLevel":394,"latitude":40.39,"latitudeRadius":0.7095,"longitude":75.26,"longitudeRadius":-1.3166,"latitudeDirection":"N","longitudeDirection":"W"},"airportName":"Allentown","city":{"cityCode":"ABE","cityName":"Allentown","timeZoneName":"America/New_York"},"country":{"countryCode":"US","countryName":"United States"},"region":{"regionCode":"AM","regionName":"Americas"}},{"airportCode":"ABF","internationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":false,"eticketableAirport":false,"location":{"aboveSeaLevel":-99999,"latitude":1.43,"latitudeRadius":0.0300,"longitude":173.00,"longitudeRadius":3.0194,"latitudeDirection":"N","longitudeDirection":"E"},"airportName":"Abaiang","city":{"cityCode":"ABF","cityName":"Abaiang","timeZoneName":"Pacific/Auckland"},"country":{"countryCode":"KI","countryName":"Kiribati"},"region":{"regionCode":"SP","regionName":"South Pacific"}},{"airportCode":"ABG","internationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":false,"eticketableAirport":false,"location":{"aboveSeaLevel":-99999,"latitude":17.35,"latitudeRadius":-0.3069,"longitude":143.10,"longitudeRadius":2.4987,"latitudeDirection":"S","longitudeDirection":"E"},"airportName":"Abingdon","city":{"cityCode":"ABG","cityName":"Abingdon","timeZoneName":"Australia/Brisbane"},"country":{"countryCode":"AU","countryName":"Australia"},"region":{"regionCode":"AU","regionName":"Australia"}},{"airportCode":"ABH","internationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":false,"eticketableAirport":false,"location":{"aboveSeaLevel":-99999,"latitude":23.37,"latitudeRadius":-0.4122,"longitude":146.37,"longitudeRadius":2.5589,"latitudeDirection":"S","longitudeDirection":"E"},"airportName":"Alpha","city":{"cityCode":"ABH","cityName":"Alpha","timeZoneName":"Australia/Brisbane"},"country":{"countryCode":"AU","countryName":"Australia"},"region":{"regionCode":"AU","regionName":"Australia"}},{"airportCode":"ABI","internationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":false,"eticketableAirport":false,"location":{"aboveSeaLevel":1790,"latitude":32.24,"latitudeRadius":0.5655,"longitude":99.40,"longitudeRadius":-1.7395,"latitudeDirection":"N","longitudeDirection":"W"},"airportName":"Abilene","city":{"cityCode":"ABI","cityName":"Abilene","timeZoneName":"America/Chicago"},"country":{"countryCode":"US","countryName":"United States"},"region":{"regionCode":"AM","regionName":"Americas"}},{"airportCode":"ABJ","internationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":true,"eticketableAirport":false,"location":{"aboveSeaLevel":20,"latitude":5.15,"latitudeRadius":0.0916,"longitude":3.55,"longitudeRadius":-0.0684,"latitudeDirection":"N","longitudeDirection":"W"},"airportName":"Abidjan","city":{"cityCode":"ABJ","cityName":"Abidjan","timeZoneName":"Etc/GMT"},"country":{"countryCode":"CI","countryName":"Ivory Coast"},"region":{"regionCode":"AF","regionName":"Africa"}},{"airportCode":"ABK","internationalAirport":false,"domesticAirport":false,"regionalAirport":false,"onlineIndicator":false,"eticketableAirport":false,"location":{"aboveSeaLevel":-99999,"latitude":6.45,"latitudeRadius":0.1178,"longitude":44.17,"lo`;

var expectedIndices = [
  505, 1029, 1550,
  2089, 2627, 3168,
  3703, 4239, 4758
];

var expectedAirport = {
  airportCode: 'ABC',
  internationalAirport: false,
  domesticAirport: false,
  regionalAirport: false,
  onlineIndicator: true,
  eticketableAirport: false,
  location: {
    aboveSeaLevel: 2221,
    latitude: 38.58,
    latitudeRadius: 0.6801,
    longitude: 1.51,
    longitudeRadius: -0.0323,
    latitudeDirection: 'N',
    longitudeDirection: 'W'
  },
  airportName: 'Albacete',
  city: {
    cityCode: 'ABC',
    cityName: 'Albacete',
    timeZoneName: 'Europe/Madrid'
  },
  country: { countryCode: 'ES', countryName: 'Spain' },
  region: { regionCode: 'EU', regionName: 'Europe' }
};
