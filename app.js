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

fs.readFile(__dirname + '/rocid.xml', { encoding: 'utf8' }, function (err, data) {
    parser.parseString(data, function (err, result) {
        var cityList = result.rocid.city;

        var parseOptions = {
            provider: "GOOGLE"
            , host: 'maps.googleapis.com'
            , path: '/maps/api/geocode/json?'
        };

        cityList.forEach(function (obj) {

            //TODO выделить в отдельный класс с проверками на провайдер
            if (parseOptions.provider.toUpperCase() === 'GOOGLE') {
                parseOptions.path += 'language=ru&'
                    + 'sensor=false&'
                    + 'address='
                    + encodeURI(obj.name);

                httpResponce
                    .getPage(parseOptions)
                    .html(function (bodyText) {

                        var cityObj = new CityObject(bodyText, {
                            provider: parseOptions.provider
                        });
                        cityObj.setName(obj.name[0]);//если не будет вызвана - добавит данные из гугла

//                        var jsonCity = cityObj.convertToJSON();//simple
                        var jsonCity = cityObj.convertoToJSON_LD();//progressive

                        console.log(jsonCity);
                    })
                ;
            } else {
                throw 'ANOTHER PROVIDER WHILE IS NOT AVAILABLE';
            }
        });
    });
});