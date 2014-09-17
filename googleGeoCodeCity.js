var http = require('http');

module.exports.getPage = function (options) {
    return {
        html: function (callback) {

            var req = http
                    .get(options, function (res) {
                        var bodyChunks = [];
                        /*Buffer the body entirely for processing as a whole.*/

                        res
                            .on('data', function (chunk) {
                                bodyChunks.push(chunk);
                            })
                            .on('end', function () {
                                var body = Buffer.concat(bodyChunks);

                                callback(String(body));
                            })
                        ;
                    })
                ;
        }
    }
};