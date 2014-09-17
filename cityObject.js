module.exports.init = function () {
    return CityObj;
};

function CityObj(bodyText, convertType) {
    this._googleGeoCodes = null;
//    this._yandexGeoCodes = null;//example

    this.city = {
        name: null,//Moscow
        description: null,//"The Empire State Building is a 102-story landmark in New York City.",
        image: null,//"http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg",
        geo: {
            latitude: null,//"40.75",
            longitude: null//"73.98"
        }
    };

    if (!convertType) throw "Argument 'convertType' is not found!";

    if (convertType.provider && convertType.provider.toUpperCase() === 'GOOGLE') {

        //TODO сделать более умную выборку
        this.convertFromGoogleGeoCode(bodyText)
            .setGeoLatitude(this._googleGeoCodes.results[0].geometry.location.lat)
            .setGeoLongitude(this._googleGeoCodes.results[0].geometry.location.lng)
            .setName(this._googleGeoCodes.results[0].address_components[0].long_name)
        ;

        delete this._googleGeoCodes;
    }

    return this;
}

CityObj.prototype.convertFromGoogleGeoCode = function (bodyText) {
    this._googleGeoCodes = JSON.parse(bodyText, function (key, value) {
        switch (key) {

            case 'status' :
                if (value !== 'OK') {
                    throw 'Response status error';
                }

                break;

            case 'lat' :
            case 'lng' :
                return parseFloat(value);

            case 'long_name' :
                return value.toUpperCase();

            default :
                return value;
        }
    });

    return this;
};

CityObj.prototype.convertToJSON = function() {
    var city = this.city;

    return JSON.stringify(city);
};

CityObj.prototype.convertoToJSON_LD = function () {

    var city = this.city,
        schema = {
            "@context": {
                "name": "http://schema.org/name",
                "description": "http://schema.org/description",
                "image": {
                    "@id": "http://schema.org/image",
                    "@type": "@id"
                },
                "geo": "http://schema.org/geo",
                "latitude": {
                    "@id": "http://schema.org/latitude",
                    "@type": "xsd:float"
                },
                "longitude": {
                    "@id": "http://schema.org/longitude",
                    "@type": "xsd:float"
                },
                "xsd": "http://www.w3.org/2001/XMLSchema#",
            }
        };

    Object.keys(city).forEach(function (e) {
        schema[e] = city[e];
    });

    return JSON.stringify(schema);
};

CityObj.prototype.setName = function (cityName) {
    this.city.name = cityName;

    return this;
};

CityObj.prototype.setGeoLatitude = function (latitude) {
    this.city.geo.latitude = latitude;

    return this;
};

CityObj.prototype.setGeoLongitude = function (longitude) {
    this.city.geo.longitude = longitude;

    return this;
};