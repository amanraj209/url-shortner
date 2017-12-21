const url = require('url');

module.exports = function (opts) {
    const self = {};

    self.opts = opts || {};
    self.opts.url = self.opts.url || 'http://127.0.0.1:8000';
    self.opts.port = self.opts.port || 8000;
    self.opts['redis-host'] = self.opts['redis-host'] || 'localhost';
    self.opts['redis-port'] = self.opts['redis-port'] || 6379;
    self.opts['redis-pass'] = self.opts['redis-pass'] || false;
    self.opts['redis-db'] = self.opts['redis-db'] || 0;

    self.checkUrl = function (s, domain) {
        const regExp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        let valid = true;

        if (!regExp.test(s)) {
            valid = false;
        }
        if (valid && domain) {
            if (url.parse(self.opts.url).hostname === url.parse(s).hostname) {
                valid = false;
            }
        }
        return valid;
    };

    self.getModel = function (callback) {
        const RedisModel = require('./redis-model');
        const config = {
            host: self.opts['redis-host'],
            port: self.opts['redis-port'],
            pass: self.opts['redis-pass'],
            db: self.opts['redis-db']
        };
        callback(null, new RedisModel(config));
    };

    self.shorten = function (long_url, callback) {
        if (this.checkUrl(long_url, true)) {
            this.getModel(function (err, model) {
                if (err) {
                    callback(500);
                } else {
                    model.set(long_url, callback);
                }
            });
        } else {
            callback(400);
        }
    };

    self.expand = function (short_url, callback, click) {
        if (this.checkUrl(short_url)) {
            short_url = short_url.split('/').pop();
        }
        if (short_url && /^[\w=]+$/.test(short_url)) {
            this.getModel(function (err, model) {
                if (err) {
                    callback(500);
                } else {
                    model.get(short_url, callback, click);
                }
            });
        } else {
            callback(400);
        }
    };
    return self;
};