const redis = require('redis');
const base58 = require('base58');
const crypto = require('crypto');

const RedisModel = module.exports = function (config, client) {
    if (config == null && client) {
        this.db = client;
    } else {
        const options = {
            host: config.host,
            port: config.port,
            db: config.db
        };
        this.db = redis.createClient(options);
        if (config.pass) {
            this.db.auth(config.pass);
        }
    }
};

const getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};

// General prefix
RedisModel._prefix = 'shtnr:';

// shtnr:counter
RedisModel.prototype.kCounter = function () {
    return RedisModel._prefix + 'counter';
};

// shtnr:url:<long_url> <short_url>
RedisModel.prototype.kUrl = function (url) {
    return RedisModel._prefix + 'url:' + this.md5(url);
};

// shtnr:hash:<id> url <long_url>
// shtnr:hash:<id> hash <short_url>
// shtnr:hash:<id> clicks <clicks>
RedisModel.prototype.kHash = function (hash) {
    return RedisModel._prefix + 'hash:' + hash;
};

// Helpers
RedisModel.prototype.md5 = function (url) {
    return crypto.createHash('md5').update(url).digest('hex');
};

// Main methods
RedisModel.prototype.uniqueId = function (callback) {
    this.db.incr(this.kCounter(), function (err, reply) {
        const hash = base58.encode(getRandomInt(9999, 999999) + reply.toString());
        if (typeof callback === 'function') {
            callback(err, hash);
        }
    });
};

RedisModel.prototype.findUrl = function (long_url, callback) {
    this.db.get(this.kUrl(long_url), function (err, reply) {
        if (typeof callback === 'function') {
            callback(err, reply);
        }
    });
};

RedisModel.prototype.findHash = function (short_url, callback) {
    this.db.get(this.kHash(short_url), function (err, reply) {
        if (typeof callback === 'function') {
            callback(err, reply);
        }
    });
};

RedisModel.prototype.clickLink = function (short_url, callback) {
    this.db.hincrby(this.kHash(short_url), 'clicks', 1, function (err, reply) {
        if (typeof callback === 'function') {
            callback(err, reply);
        }
    });
};

// Set record
RedisModel.prototype.set = function (long_url, callback) {
    const self = this;

    this.findUrl(long_url, function (err, reply) {
        if (err) {
            callback(500);
            self.db.quit();
        } else if (reply) {
            callback(null, {
                'hash': reply,
                'long_url': long_url
            });
            self.db.quit();
        } else {
            self.uniqueId(function (err, hash) {
                if (err) {
                    callback(500);
                    self.db.quit();
                } else {
                    const response = {
                        'hash': hash,
                        'long_url': long_url
                    };
                    self.db.multi([
                        ['set', self.kUrl(long_url), response.hash],
                        ['hmset', self.kHash(response.hash),
                         'url', long_url,
                         'hash', response.hash,
                         'clicks', 0
                        ]
                    ]).exec(function (err, replies) {
                        if (err) {
                            callback(503);
                        } else {
                            callback(null, response);
                        }
                        self.db.quit();
                    });
                }
            });
        }
    });
};

// Get record
RedisModel.prototype.get = function (short_url, callback, click) {
    const self = this;

    this.findHash(short_url, function (err, reply) {
        if (err) {
            callback(500);
        } else if (reply && 'url' in reply) {
            if (click) {
                self.clickLink(reply.hash);
            }

            callback(null, {
                'hash': reply.hash,
                'long_url': reply.url,
                'clicks': reply.clicks || 0
            });
        } else {
            callback(404);
        }
        self.db.quit();
    });
};