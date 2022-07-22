var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let helpers = require("handlebars-helpers")
 var session= require('express-session')
var hbs = require('express-handlebars');
var db=require("./config/connection")
var fileUpload=require('express-fileupload')
const HBS = hbs.create({});



db.connect((err)=>{
  if(err){
      console.log("connection error :"+err);
  }else{
    console.log("Database connected successfully");
  }
  })

  var indexRouter = require('./routes/index');
  var adminRouter = require('./routes/admin');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine("hbs",hbs.engine({helpers: {
  inc: function (value, options) {
    return parseInt(value) + 1;}},extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:"key",cookie:{maxAge:600000 }}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())



app.use((req,res,next)=>{
  if(!req.user){
    res.header('cache-control','private,no-caches,no-Store,must revalidate')
    res.header('Express','-3')
  }
  next();
})

app.use('/', indexRouter);
app.use('/admin', adminRouter);


//error page 404

app.get('*',(req,res)=>{
  res.render('user/error',{user:true})
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

HBS.handlebars.registerHelper("ifCompare", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
