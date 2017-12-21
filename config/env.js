const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

module.exports = function (express, app) {
    __dirname = app.get('__dirname');

    // View engine setup
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'views'));

    // Middlewares
    app.use(cors());
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(methodOverride())
    app.use(express.static(path.join(__dirname, 'public')));
};