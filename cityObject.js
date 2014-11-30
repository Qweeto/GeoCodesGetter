function CityObj(bodyText, convertType) {
	this._googleGeoCodes = null;

	//output json format
	this.city = {
		name: null,
		geo: {}
	};

	if (!convertType) throw 'Argument "convertType" is not found!';
	if (!convertType.provider) throw 'Provider is not found';

	if (convertType.provider.toUpperCase() === 'GOOGLE') {
		var geoObj = this.convertFromGoogleGeoCode(bodyText);

		if (geoObj === null) {
			console.log('geoObj is null');

			return null;
		} else {
			try {
				geoObj
					.setGeoLatitude(this._googleGeoCodes.results[0].geometry.location.lat)
					.setGeoLongitude(this._googleGeoCodes.results[0].geometry.location.lng)
					.setName(this._googleGeoCodes.results[0].address_components[0].long_name)
				;
			} catch (e) {
				console.log(e.message);

				return null;
			}
		}

		delete this._googleGeoCodes;
	}

	return this;
}

/* PROVIDERS CONVERTING */
CityObj.prototype.convertFromGoogleGeoCode = function (bodyText) {
	var parseBody = JSON.parse(bodyText, function (key, value) {
		switch (key) {

			case 'status' :
				if (value === 'OVER_QUERY_LIMIT') {
					throw 'Over query limit. Please try tomorrow';
				}

				if (value !== 'OK') {
					return {
						error: 'Response status error'
					};
				}

				break;

			case 'lat' :
			case 'lng' :
				return parseFloat(value);

			default :
				return value;
		}
	});

	this._googleGeoCodes = parseBody;

	return this;
};

/* Simple JSON Converters */
CityObj.prototype.convertToJSON = function () {
	var city = this.city;

	return JSON.stringify(city, null, 2);//formatted view
	//return JSON.stringify(city);//uglify view
};

/* JSON_LD Converter */
CityObj.prototype.convertoToJSON_LD = function () {
	var city = this.city;
	var schema = {
		"@context": {
			"name": "http://schema.org/name"
			, "description": "http://schema.org/description"
			, "image": {
				"@id": "http://schema.org/image"
				, "@type": "@id"
			}
			, "geo": "http://schema.org/geo"
			, "latitude": {
				"@id": "http://schema.org/latitude"
				, "@type": "xsd:float"
			}
			, "longitude": {
				"@id": "http://schema.org/longitude"
				, "@type": "xsd:float"
			}
			, "xsd": "http://www.w3.org/2001/XMLSchema#"
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
	this.city.geo.lat = parseFloat(latitude.toFixed(4));

	return this;
};

CityObj.prototype.setGeoLongitude = function (longitude) {
	this.city.geo.lng = parseFloat(longitude.toFixed(4));

	return this;
};

module.exports.init = function () {
	return CityObj;
};