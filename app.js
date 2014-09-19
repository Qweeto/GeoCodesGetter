/**
 * Google geocoder latitude/longitude and name attributes for cities list (rocid.xml)
 * */
var fs = require('fs')
    , xml2js = require('xml2js')
    , http = require('http')
    , httpResponce = require('./googleGeoCodeCity.js')
    , CityObject = require('./cityObject.js').init()
;

var parser = new xml2js.Parser();
var requestsPerSec = 7;//TODO for free account 10 requests per second! I have not recommend to set less more than 15

var writer = fs.createWriteStream('city.json', {flags: 'w'});
writer.on('finish', function () {
    console.log('writer finish completed.');
});

function write(text) {
    var success = writer.write(text);

    if (!success) {
        writer.once('drain', write);
    }
}

fs.readFile(__dirname + '/rocid_capital.xml', { encoding: 'utf8' }, function (err, data) {
    parser.parseString(data, function (err, result) {
        var cityList = result.rocid.city
            , index = cityList.length - 1;

        const parseOptions = {
            provider: "GOOGLE", host: 'maps.googleapis.com', path: '/maps/api/geocode/json?'
        };

        /* START */
        console.log('start...');
        nextCity();

        function nextCity() {
            setTimeout(function () {
                if (index < 0) {
                    writer.end();
                    return;
                }

                parseCity(function (jsonCity, error) {

                    if(error) {
                        console.error('write error : ' + error.err);
                        write(']');
                        return;
                    }

                    /* write to the file */
                    if (jsonCity !== null) {
                        if (index === cityList.length - 1) {
                            write('[');
                        } else if (index > 0) {
                            write(jsonCity + ',');
                        } else {
                            write(jsonCity + ']');
                        }
                    }

                    nextCity();
                    index--;
                });
            }, 1000 / requestsPerSec);
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
                    var jsonCity = null
                        ,cityObj = null;

                    try {
                        cityObj = new CityObject(bodyText, {
                            provider: googlePath.provider
                        });
                    } catch(e) {
                        return callback(jsonCity, {err: e});
                    }

                    if (cityObj !== null) {
                        cityObj.setName(cityName.toUpperCase());//если не будет вызвана - добавит данные из гугла

                        jsonCity = cityObj.convertToJSON();//simple
//                        var jsonCity = cityObj.convertoToJSON_LD();//progressive
                    }

                    console.log(cityObj);

                    callback(jsonCity);
                })
            ;
        }

        function parseCity(callback) {
            var city = getCity(index)
                , cityName = city.name[0].toLowerCase();

            //TODO выделить в отдельный класс с проверками на провайдер
            if (parseOptions.provider.toUpperCase() === 'GOOGLE') {
                googleParse(cityName, callback);
            } else {
                throw 'ANOTHER PROVIDER WHILE IS NOT EXIST';
            }
        }
    });
});