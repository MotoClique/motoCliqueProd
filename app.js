//  Moto Clique Node application
//importing modules

var express = require('express'),
app     = express(),
morgan  = require('morgan');

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));


// BRING IN YOUR SCHEMAS & MODELS
//admin schemas
require('./models/users');
require('./models/profile');
require('./models/subscription');
require('./models/spec_fields');
require('./models/screens');
require('./models/role');
require('./models/product_type');
require('./models/product_thumbnail');
require('./models/product_spec');
require('./models/product_image');
require('./models/product_hierarchy');
require('./models/product');
require('./models/prd_typ_spec_field_map');
require('./models/otp');
require('./models/fields');
require('./models/brand');
require('./models/application');
require('./models/app_scr_fields_rights');
require('./models/country_state_city_loc');
require('./models/parameter');

//endusers schemas
require('./models/enduser/bid');
require('./models/enduser/bid_by');
require('./models/enduser/buy_request');
require('./models/enduser/favourite');
require('./models/enduser/filter');
require('./models/enduser/images');
require('./models/enduser/sell');
require('./models/enduser/thumbnails');
require('./models/enduser/user_address');
require('./models/enduser/user_alert');
require('./models/enduser/user_sub_map');
require('./models/enduser/service');
require('./models/enduser/feedback');
require('./models/enduser/rating');
require('./models/enduser/thumbs_up');
require('./models/enduser/thumbs_down');
require('./models/enduser/counter');

var mongoose = require('mongoose');
var passport = require('passport');
const route = require('./route');
require('./config/passport');

var bodyparser = require('body-parser');
var cors = require('cors');
var path = require('path');

app.use(cors());
app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static(path.join(__dirname, 'views')));

app.use(passport.initialize());
app.use('/api',route);



// MongoDB Connection

var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  var mongoURL = "mongodb://motoadmin:Moto@123@ds217002.mlab.com:17002/motodb";

  var mongodb = require('mongodb');
  
  mongoose.connect(mongoURL);
  db = true;
};


app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  
  res.render('index.html', { pageCountMessage : null});
});


app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
 
  res.send('{ pageCount: -1 }');
});

app.get('*', function (req, res) {
      // try to initialize the db on every request if it's not already
      if (!db) {
        initDb(function(err){});
      }
      
	  res.render('index.html', { pageCountMessage : null});
});


// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});


module.exports = app ;
