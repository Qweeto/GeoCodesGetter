/**
 * Google geocoder latitude/longitude and name attributes for cities list (rocid.xml)
 * */
var fs = require('fs')
    ,xml2js = require('xml2js')
    ,http = require('http')
    ,httpResponce = require('./googleGeoCodeCity.js')
    ,CityObject = require('./cityObject.js').init()
;

var parser = new xml2js.Parser();
var requestsPerSec = 5;//TODO for free account 10 requests per second! I have not recommend to set less more than 15

fs.readFile(__dirname + '/rocid.xml', { encoding: 'utf8' }, function (err, data) {
    parser.parseString(data, function (err, result) {
        var cityList = result.rocid.city;
        var index = cityList.length - 1;

        const parseOptions = {
            provider: "GOOGLE"
            , host: 'maps.googleapis.com'
            , path: '/maps/api/geocode/json?'
        };

        //START
        nextCity();

        function nextCity() {
            setTimeout(function() {
                if(index < 0) {
                    return;
                }

                parseCity(function() {
                    nextCity();
                    index--;
                });
            }, 1000 / requestsPerSec );
        }
        function getCity(index) {
            return cityList[index];
        }

        function googleParse(cityName, callback) {
            var googlePath = Object.create(parseOptions);
            googlePath.path = parseOptions.path
                + 'language=ru&'
                + 'sensor=false&'
                + 'address='
                + encodeURI(cityName);

            httpResponce
                .getPage(googlePath)
                .html(function (bodyText) {
                    var cityObj = new CityObject(bodyText, {
                        provider: googlePath.provider
                    });
                    if(cityObj !== null) {
                        cityObj.setName(cityName.toUpperCase());//если не будет вызвана - добавит данные из гугла
                        //                        var jsonCity = cityObj.convertToJSON();//simple
                        var jsonCity = cityObj.convertoToJSON_LD();//progressive

                        //FIXME: записывать этот json в файл?
                        console.log(jsonCity);
                    }

                    callback();
                })
            ;
        }

        function parseCity(callback) {
            var city = getCity(index);
            var cityName = city.name[0].toLowerCase();

            //TODO выделить в отдельный класс с проверками на провайдер
            if (parseOptions.provider.toUpperCase() === 'GOOGLE') {
                console.log(city)
                googleParse(cityName, callback);
            } else {
                throw 'ANOTHER PROVIDER WHILE IS NOT AVAILABLE';
            }
        }
    });
});