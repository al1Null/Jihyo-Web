const express = require("express");
const app = express();
const request = require("request");
const http = require("http");
const https = require("https");
const fs = require("fs");
const redirectServer = http.createServer(app);
/***
 * Listen for unsecured connection.
 */
app.use(function requireHTTPS(req, res, next) {
  if (!req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
})

app.listen(80);

/**
 * Configuration of express.
 */
app.set("view engine", "ejs");
app.use("/assets", express.static("assets"));

/**
 * Routes
 */
let indexRouter = require("./routers/index");
let apiRouter = require("./routers/api");
let analysisRouter = require("./routers/analysis");
let statsRouter = require("./routers/stats");

app.use("/", indexRouter);
app.use("/analysis", analysisRouter);
app.use("/api", apiRouter);
app.use("/stats", statsRouter);

/***
 * SSL Options
 */
var options = {
	ca: fs.readFileSync(`jihyo_me.ca-bundle`),
	key: fs.readFileSync(`jihyo.me.key`),
	cert: fs.readFileSync(`jihyo_me.crt`)
};

/**
 * App Listen and Export
 */
https.createServer(options, app).listen(443);

module.exports = app;
