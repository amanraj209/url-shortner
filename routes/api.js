module.exports = function (app, shortner) {
    const opts = app.get('opts');
    const http = require('http');
    const router = require('express').Router();

    router.route('/shorten').post(function (req, res) {
        shortner.shorten(req.body['long_url'], function (err, reply) {
            if (err) {
                jsonResponse(res, err);
            } else if (reply) {
                reply.short_url = opts.url.replace(/\/$/, '') + '/' + reply.hash;
                jsonResponse(res, 200, reply);
            } else {
                jsonResponse(res, 500);
            }
        });
    });

    router.route('/expand').post(function (req, res) {
        shortner.expand(req.body['short_url'], function (err, reply) {
            if (err) {
                jsonResponse(res, err);
            } else if (reply) {
                jsonResponse(res, 200, reply);
            } else {
                jsonResponse(res, 500);
            }
        });
    });

    router.route('/expand/:short_url').get(function (req, res) {
        shortner.expand(req.params.short_url, function (err, reply) {
            if (err) {
                jsonResponse(res, err);
            } else if (reply) {
                jsonResponse(res, 200, reply);
            } else {
                jsonResponse(res, 500);
            }
        });
    });

    function jsonResponse (res, code, data) {
        data = data || {};
        data.status_code = (http.STATUS_CODES[code]) ? code : 503;
        data.status_txt = http.STATUS_CODES[code] || http.STATUS_CODES[503];

        res.status(data.status_code).json(data);
    }

    return router;
};