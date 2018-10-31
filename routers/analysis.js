const request = require("request");
const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const fs = require("fs");


/***
 * Get data from the server
 */
let topPlayersStandard = require("../assets/datas/dynamic/topPlayersStandard.json"),
	topPlayersTaiko = require("../assets/datas/dynamic/topPlayersTaiko.json"),
	topPlayersCatch = require("../assets/datas/dynamic/topPlayersCatch.json"),
	topPlayersMania = require("../assets/datas/dynamic/topPlayersMania.json"),
	countryDataStandard = require("../assets/datas/static/countryDataStandard.json");
	countryDataTaiko = require("../assets/datas/static/countryDataTaiko.json"),
	countryDataCatch = require("../assets/datas/static/countryDataCatch.json"),
	countryDataMania = require("../assets/datas/static/countryDataMania.json");

/***
 * Routes for /analysis
 */
router.get("/", function(req, res) {
	res.render("analysis", {
		dataTaiko: JSON.stringify(topPlayersTaiko),
		dataStandard: JSON.stringify(topPlayersStandard),
		dataMania: JSON.stringify(topPlayersMania),
		dataCatch: JSON.stringify(topPlayersCatch),
		
		countryDataStandard: JSON.stringify(countryDataStandard),
		countryDataTaiko: JSON.stringify(countryDataTaiko),
		countryDataCatch: JSON.stringify(countryDataCatch),
		countryDataMania: JSON.stringify(countryDataMania)
	});
});

module.exports = router;
