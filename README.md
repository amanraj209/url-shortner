# URL Shortner

A minimalist and lightweight URL shortner using Node.js and Redis.

## Using

- [Express 4](http://expressjs.com/)
- [Redis](https://redis.io/)

## Folder Structure
```
url-shortner/
    bin/
        www
    config/
        env.js
        opts.js
    lib/
        redis-model.js
        shortner.js
    public/
    routes/
        api.js
        index.js
    views/
        error.hbs
        index.hbs
    .gitignore
    app.js
    package.json
    package-lock.json
    README.md
```

## Installation
```
$ git clone https://github.com/amanraj209/url-shortner.git
$ cd url-shortner
$ npm install
$ npm start
```

Server will run on http://127.0.0.1:8000.