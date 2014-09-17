module.exports.init = function () {
    return CityObj;
};

/* CONSTRUCTOR */
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
        var geoObj = this.convertFromGoogleGeoCode(bodyText);
        if(geoObj === null) {
            return null;
        } else {
            geoObj
                .setGeoLatitude(this._googleGeoCodes.results[0].geometry.location.lat)
                .setGeoLongitude(this._googleGeoCodes.results[0].geometry.location.lng)
                .setName(this._googleGeoCodes.results[0].address_components[0].long_name)
            ;
        }

        delete this._googleGeoCodes;
    }

    return this;
}

/* PROVIDERS CONVERTING */
CityObj.prototype.convertFromGoogleGeoCode = function (bodyText) {
    var error = false;
    var parseBody = JSON.parse(bodyText, function (key, value) {
        switch (key) {

            case 'status' :
                if (value !== 'OK') {
                    error = true;
                    console.warn('Response status error');
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

    if(error) {
        return null;
    }

    this._googleGeoCodes = parseBody;
    return this;
};

/* JSON Converters */
CityObj.prototype.convertToJSON = function() {
    var city = this.city;

    return JSON.stringify(city);
};

CityObj.prototype.convertoToJSON_LD = function () {
    var city = this.city,
        schema = {
            "@context": {
                "name": "http://schema.org/name"
                ,"description": "http://schema.org/description"
                ,"image": {
                    "@id": "http://schema.org/image"
                    ,"@type": "@id"
                }
                ,"geo": "http://schema.org/geo"
                ,"latitude": {
                    "@id": "http://schema.org/latitude"
                    ,"@type": "xsd:float"
                }
                ,"longitude": {
                    "@id": "http://schema.org/longitude"
                    ,"@type": "xsd:float"
                }
                ,"xsd": "http://www.w3.org/2001/XMLSchema#"
            }
        };

    Object.keys(city).forEach(function (e) {
        schema[e] = city[e];
    });

    return JSON.stringify(schema);
};

/* SETTERS */
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

CityObj.prototype.setDescription = function(description) {
    this.city.description = description;

    return this;
};

CityObj.prototype.setImage = function(imageUrl) {
    this.city.image = imageUrl;

    return this;
};