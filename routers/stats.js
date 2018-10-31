const request = require("request");
const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");

let countryISOCodes = require("../assets/datas/static/isoCountryCodes.json");
/***
 * Start of routes for /stats
 */
router.get("/", function(req, res) {
	res.render("stats", {
		countryISOCodes: JSON.stringify(countryISOCodes)
	});
});

module.exports = router;
