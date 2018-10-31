const express = require("express");
const router = express.Router();
const request = require("request");
const bodyParser = require("body-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const cheerio = require("cheerio");

/***
 * MongoDB Connection Setup
 */
/*const Bug = require("../models/bug");
const Beatmap = require("../models/beatmap");

require("../assets/datas/helper.js");

mongoose.connect("mongodb://178.128.73.182:27017/", {
	user: process.env.DB_USERNAME,
	pass: process.env.DB_PASSWORD,
	dbName: "osuanalysis"
}, (err, res) => {
	if (err) throw err;

	console.log("[Mongoose] Successfully connected to dB");
});*/


/***
 * Using Body parser with express.
 */
router.use(bodyParser.urlencoded({
	extended: true
}));



/***
 * Routes for /api endpoint
 */
router.get("/", function(req, res) {
	res.json({
		version_name: "Fox",
		version: "0.0.1",
		author: "RepeaterCreeper"
	})
});


/***
 * Returns data retrieved from the #json-user element in the user's profile page. (Direct Scraping)
 * if no data is returned it will automatically return { error: true }
 *
 * @param {id<String> - E.g.: al1 or 9609675 - The username or user_id of the username you want to get information on.}
 * @param {datas<Array> - E.g: * (for all data), id (for id only), id,statistics.pp_rank (id and pp_rank) - Specific data you want to get ONLY}
 * @param {mode<String:Enum> - E.g: osu, taiko, fruits, mania - The user mode you want to get data from.}
 * @param {best<Int:OPTIONAL> - E.g: 10,0 [limit, offset] - Will return the top plays of the user you provided for the MODE specified.}
 *
 * @return {payload<JSON> - All the data that is retrieved, if error will return - {error: true} }
 */
router.get("/get_user_data/:id/:datas/:mode/:best?", function(req, res) {
	/**
	 * Make everything optional parameter except for id
	 * Set default values for datas, mode, and best.
	 * If best is set, but not the reset, just call the best end point.
	 */


	let user_id = req.params.id,
		datas = req.params.datas,
		mode = req.params.mode;
	//best = req.params.best;

	request(`https://osu.ppy.sh/users/${user_id}/${mode}/`, function(err, resp, body) {
		const $ = cheerio.load(body);

		let user_data = JSON.parse($("#json-user").html());

		if (user_data) {
			user_data = JSON.parse($("#json-user").html().trim());

			let payload = {};

			if (datas == "*") {
				payload.user_data = user_data;
			} else {
				let temporary_data_storage = {};

				datas = datas.split(",");

				for (let point in datas) {
					if (datas[point].includes("[")) { // Level Subindex ONLY
						let parentIndex = datas[point].substring(0, datas[point].indexOf("["));
						let subIndexL1 = datas[point].substr(datas[point].indexOf("[")).replace("[", "").replace("]", "");

						temporary_data_storage[datas[point]] = user_data[parentIndex][subIndexL1];
					} else {
						temporary_data_storage[datas[point]] = user_data[datas[point]];
					}
				}

				payload.user_data = temporary_data_storage;
				//res.json(temporary_data_storage);

			}

			if (req.params.best) {

				let user_id = payload.user_data.id,
					best_split = req.params.best.split(",");
				payload.user_best = [];

				request(`https://osu.ppy.sh/users/${user_id}/scores/best?mode=${mode}&limit=${best_split[0]}&offset=${best_split[1]}`, function(err, response, body) {
					let parsedData = JSON.parse(body);

					payload.user_best = parsedData;

					res.json(payload);
				});
			} else {
				res.json(payload);
			}

			//res.json(payload);
		} else {
			res.json({
				error: true
			});
		}
	});
})
/***
 ** For rec. app
 ***/

router.get("/get_userid/:username/:mode", function(req, res) {
	let username = req.params.username,
		mode = req.params.mode;

	request(`https://osu.ppy.sh/users/${username}/${mode}`, function(err, resp, body) {
		const $ = cheerio.load(body);

		let user_data = JSON.parse($("#json-user").html().trim());
		res.send(user_data)
	});

});

router.get("/leaderboard_global/:page_num/:mode", function(req, res) {
	let page_num = req.params.page_num,
		mode = req.params.mode;

	let usernames = []
	let user_datas = {};
	request(`https://osu.ppy.sh/rankings/${mode}/performance?page=${page_num}#scores`, function(err, resp, body) {
		let $ = cheerio.load(body);

		for (var i = 0; i < 50; i++) {
			usernames.push($(".ranking-page-table__row").eq(i).find("td").eq(1).text().trim());
		}

		res.send(usernames)

// 		function loopUsernames(index) {
// 			request(`https://osu.ppy.sh/users/${usernames[index]}/${mode}`, function(err, resp, body) {
// 				let $ = cheerio.load(body);
// 				let user_data = JSON.parse($("#json-user").html().trim());
// 				user_datas[usernames[index]] = user_data;

// 				if (index < 50) {
// 					loopUsernames(index + 1);
// 				} else {
// 					//console.log(user_data)
// 					res.send(user_datas);
// 				}
// 			});
// 		}

		// loopUsernames(0);
	});

});

router.get("/leaderboard_country/:page_num/:mode/:country", function(req, res) {
	let page_num = req.params.page_num,
		mode = req.params.mode,
		country = req.params.country;

	let usernames = []
	let user_datas = {};
	request(`https://osu.ppy.sh/rankings/${mode}/performance?country=${country}&page=${page_num}#scores`, function(err, resp, body) {
		let $ = cheerio.load(body);

		for (var i = 0; i < 50; i++) {
			usernames.push($(".ranking-page-table__row").eq(i).find("td").eq(1).text().trim());
		}

		res.send(usernames)

	});

});

router.get("/top_plays/:user/:mode/:limit", function(req, res) {
	let user = req.params.user,
		mode = req.params.mode,
		limit = req.params.limit;

	request(`https://osu.ppy.sh/api/get_user_best?k={{KEY}}&u=${user}&m=${mode}&limit=${limit}`, function(err, resp, body) {
		let data = JSON.parse(body);
		res.send(data);
	});
})
//==============================================================================
// General [OSU-Analysis]
//==============================================================================

/***
 * Saves bug to the MongoDB. If not valid, will throw an error instead of saving it to the database.
 */
router.post("/save_bug", function(req, res) {

	let bug = new Bug({
		name: req.body.name,
		email: req.body.email,
		description: req.body.description
	});

	bug.save(function(err) {
		if (err) throw err;

		res.send("Successfully sent to the Dev Team");
	})
});

/***
 * Returns all the bugs that has been saved to the database that has yet to be resolved. {status: pending}
 */
router.get("/get_all_database", function*(req, res) {
	Bug.find({}, function(err, data) {
		if (err) throw err;

		console.log(data.length);
	})
});


module.exports = router;
