var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var favicon = require("serve-favicon");
var bodyParser = require("body-parser");
var cors = require("cors");
var config = require("./config");

var app = express();

app.use(express.static("./public"));

var corsOption = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"]
};
app.use(cors(corsOption));

//Set up mongoose connection
var mongoose = require("mongoose");
var mongoDB = config.mongoDb.url;
mongoose.connect(
  mongoDB,
  { useNewUrlParser: true }
);
require("./models/GoogleUser");
require("./models/Buddy");
require("./models/Student");
require("./models/Company");
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var mainRouter = require("./routes/main_routes");
var apiRouter = require("./api/resource_api");

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies.
app.use(bodyParser.json({ limit: "5mb" }));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/googleapi/v1/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  if (err.status == 404) {
    console.log("Attempt to access resource", req.url, "redirecting to /");
    res.redirect("/");
  } else {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  }
});

module.exports = app;
