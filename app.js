/**
 * Google geocoder latitude/longitude and name attributes for cities list (rocid.xml)
 * */
var fs = require('fs')
	, xml2js = require('xml2js')
	, http = require('http')
	, httpResponce = require('./googleGeoCodeCity.js')
	, CityObject = require('./cityObject.js').init()
	, parser = new xml2js.Parser();

var writer = fs.createWriteStream('city.json', {flags: 'w'});
var requestsPerSec = 1000 / 7;//free account requests limit
var lang = 'en';//localization data (ru/en/other...)

writer.on('finish', function () {
	console.log('writer finish completed.');
});

function write(text) {
	var success = writer.write(text);

	if (!success) {
		writer.once('drain', write);
	}
}

fs.readFile(__dirname + '/rocid_capital.xml', {encoding: 'utf8'}, function (error, data) {
	parser.parseString(data, function (error, result) {
		var cityList = result.rocid.city;
		var index = 0;
		var lastIndex = cityList.length - 1;
		var parseOptions = {
			provider: 'GOOGLE',
			host: 'maps.googleapis.com',
			path: '/maps/api/geocode/json?'
		};

		/* START */
		console.log('start...');

		nextCity();

		function nextCity() {

			setTimeout(function () {
				if (index === lastIndex) {
					writer.end();

					return;
				}

				parseCity(function (obj) {
					if (obj.error) {
						console.log('write error : ' + obj.error.error);
					} else if (!obj.value) {
						console.log('jsonCity is null');
					} else {
						console.log(obj.value);

						/* write to the file */
						if (index === 0) {
							write('[');
						} else if (index < lastIndex) {
							write(obj.value + ',');
						} else {
							write(obj.value + ']');
						}
					}

					nextCity();
					++index;
				});
			}, requestsPerSec);
		}

		function getCity(index) {
			return cityList[index];
		}

		function googleParse(cityName, callback) {
			var googlePath = Object.create(parseOptions);
			googlePath.path = parseOptions.path
			+ 'language=' + lang
			+ '&sensor=false'
			+ '&address='
			+ encodeURI(cityName);

			httpResponce
				.getPage(googlePath)
				.html(function (bodyText) {
					var jsonCity = null;
					var cityObj = null;

					cityObj = new CityObject(bodyText, {
						provider: googlePath.provider
					});

					if (cityObj instanceof CityObject) {
						jsonCity = cityObj.convertToJSON();//simple JSON
						//jsonCity = cityObj.convertoToJSON_LD();//JSON_LD
					} else {
						return callback({error: true});
					}

					return callback({
						error: null,
						value: jsonCity
					});
				})
			;
		}

		function parseCity(callback) {
			var city = getCity(index);
			var cityName = city.name[0].toLowerCase();

			if (parseOptions.provider.toUpperCase() === 'GOOGLE') {
				googleParse(cityName, callback);
			} else {
				throw 'ANOTHER PROVIDER WHILE IS NOT EXIST';
			}
		}
	});
});