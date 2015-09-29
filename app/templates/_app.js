'use strict';

// Module dependencies.
var express = require('express'),
path = require('path'),
fs = require('fs'),
methodOverride = require('method-override'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
errorhandler = require('errorhandler');

<% if(useUserAuth){ %>
    var jwt=require('express-jwt');
    var gcon=require('./config/gcon');
    <% } %>

    var app = module.exports = exports.app = express();

    app.locals.siteName = "<%= capName %>";

// Connect to database
var db = require('./config/db');
app.use(express.static(__dirname + '/public'));


// Bootstrap models
var modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});

var env = process.env.NODE_ENV || 'development';

if ('development' == env) {
    app.use(morgan('dev'));
    app.use(errorhandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.set('view options', {
        pretty: true
    });
}

if ('test' == env) {
    app.use(morgan('test'));
    app.set('view options', {
        pretty: true
    });
    app.use(errorhandler({
        dumpExceptions: true,
        showStack: true
    }));
}

if ('production' == env) {
    app.use(morgan());
    app.use(errorhandler({
        dumpExceptions: false,
        showStack: false
    }));
}

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

<% if(useUserAuth){ %>
   //Auth
   app.use(jwt({ secret: gcon.jwtSecret}).unless({path: ['/api/login']}));

   app.use(function (err, req, res, next) {
      if (err.name === 'UnauthorizedError') {
        res.status(401).json({err:true,msg:'invalid token...'});
    }
});
   <% } %>




// Bootstrap routes
var routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(function(file) {
  app.use('/', require(routesPath + '/' + file));
});

// Bootstrap api
var apiPath = path.join(__dirname, 'api');
fs.readdirSync(apiPath).forEach(function(file) {
  app.use('/api', require(apiPath + '/' + file));
});

// Start server
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});
