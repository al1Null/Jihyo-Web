let	mode_name = {osu: "osu!standard", taiko: "osu!taiko", fruits: "osu!catch", mania: "osu!mania"};

$("div[data-redirect]").on("click", function(e){
	window.location.href = "/" + $(this).data('redirect');
});

/***
 * Converts string representation of a letter rank and changes it to the one listed in the server
 * directory. REplacing any characters as necessary
 *
 * @param {String} letterRank - Letter Rank will signify the rank that is associated with the image
 * @return {String} - Returns the filename of the image for that letter rank.
 */
function getBadge(letterRank) {
	return `Score-${letterRank.replace("H", "Plus").replace("D", "F").replace("X", "SS")}-Small-60@2x.png`;
}

/***
 * Saves bug to the database after parsing for any malicious content, etc.
 */
function submitBug() {
	let name = $("input#name").val(),
		email = $("input#email").val(),
		description = $("textarea#description").val(),
		errors = [];

	if (name.length > 0 &&
	   	email.length > 0 &&
	   	description.length > 0) {
		$.post({
			url: "/api/save_bug",
			data: {name: name, email: email, description: description},
			success: function(data){
				return true;
			}
		}).fail(function(){
			return false;
		});
	} else {
		let inputs = ["input#name", "input#email", "textarea#description"];

		let getErrorMessage = function(elementName) {
			switch (elementName) {
				case "name":
					return "Name is required!";
				case "email":
					return "Email is required!";
				case "description":
					return "Description is required!";
			}
		}

		for (var i = 0; i < 3; i++) {
			if ($(inputs[i]).val().length === 0) {
				$(inputs[i]).addClass("invalid");
				$(inputs[i]).removeClass("valid");
				$(inputs[i]).next().next().attr("data-error", getErrorMessage(inputs[i].split("#")[1]))
			} else {
				$(inputs[i]).removeClass("invalid");
				$(inputs[i]).addClass("valid");
				$(inputs[i]).next().next().attr("data-success", `${inputs[i].split("#")[1].charAt(0).toUpperCase() + inputs[i].split("#")[1].substr(1)} is valid!`);
			}
		}
	}
}

//==========================================================================
//= Statistics page specific UTILS
//==========================================================================

/***
 * Generates a bold element depending on if the user is active (green), or if the
 * user is inactive (red).
 *
 * @param {String<active>}
 * @return {String<b_element>} - The element that is going to be appended based on if active or not.
 */
function isUserActive(active) {
	return active ? "<b class='green-text'>User is active</b>" : "<b class='red-text'>User is inactive</b>";
}

/***
 * Simply converts secondss to HHhr MMm SSs
 *
 * @return {String<format_hhmmss>}
 */
function convertTime(time) {
	var sec_num = parseInt(time, 10);
	var hours   = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}

	return hours+'hr '+minutes+'m '+seconds+"s";
}

function renderUserBest(username, mode, offset) {
	$.get({
		url: `/api/get_user_data/${username}/*/${mode}/10,${offset}`,
		success: function(data) {
			let bests = "";

			for (var best in data.user_best) {// 10 times
				let playStats = {
					pp 				: parseInt(data.user_best[best].pp),
					date         	: data.user_best[best].created_at.substring(0, 10),
					// return time since play was made
					beatmap_url 	: data.user_best[best].beatmap.url,
					rank            : getBadge(data.user_best[best].rank),
					mods            : data.user_best[best].mods,
					title			: data.user_best[best].beatmapset.title,
					difficulty 		: Number(data.user_best[best].beatmap.difficulty_rating).toPrecision(3)
				}

				bests += `<tr><td style="text-align: center;">${parseInt(best)+parseInt(offset) + 1}</td>
					<td style="text-align: center;"><img src='assets/image/badges/${playStats.rank}' width='42px'/></td>
					<td style="text-align: center;"><a target="_blank" href='${playStats.beatmap_url}'> ${playStats.title} </a></td>
					<td style="text-align: center;">${playStats.mods}</td>
					<td style="text-align: center;">${playStats.difficulty} &#9734</td>
					<td style="text-align: center;">${playStats.date}</td>
					<td style="text-align: center; font-weight: bold; font-size: 2.7em">${playStats.pp}</td></tr>`;
			}

			$("#rows_top_play").append(bests);

			$("#load_more_users").data("offset", offset + 10);
			$("#load_more_users").attr("disabled", false);
		}
	})
}
/***
 * Render a profile based on the passed parameters
 */
function renderProfile(options) {
	$("#uid_spinner").toggleClass("hide", false);
	$("#user_information_datas").toggleClass("hide", true);

	let userData = options.user_data,
		userBest = options.user_best,
		mode = options.mode;

	let templateHeader = `
		<span style="font-size: 4em;">${userData.username}<br></span>
		<span style="font-size: 1.8em;">${mode_name[mode]}<br></span>
		<a href='https://osu.ppy.sh/u/${userData.id}' target="_blank">https://osu.ppy.sh/u/${userData.id}</a><br>

		<img id="avatar" width="128" src=${userData.avatar_url}>

		<br>

		<span>Time Played - ${convertTime(userData.statistics.play_time)}</span>
		<span>Global Rank - ${userData.statistics.pp_rank}</span>
		<span>Play Count - ${userData.statistics.play_count}</span>
		<span>Level - ${userData.statistics.level.current}</span>
		<span>Accuracy - ${Number(userData.statistics.hit_accuracy).toPrecision(4)}</span>
		<span>Ranked ${userData.statistics.rank.country} in ${countryISOCodes[userData.country.code]}</span>

		<span>Play Style - ${userData.playstyle}</span>

		<br>

		<span>${isUserActive(userData.is_active)}</span>
	`;

	renderUserBest(userData.username, mode, 0);

	$("#results_top").append(templateHeader);

	setTimeout(function(){
		$("#uid_spinner").toggleClass("hide", true);
		$("#user_information_datas").toggleClass("hide", false);
	}, 1000)

}
/***
 * Get the profile of the user after the `#submitUser` button has been pressed. Will validate
 * the user's input, if invalid will be prompted to enter another user.
 */
function getUserProfile(...args) {
	$("#results_top").empty();
	$("#error").empty();
	$("#rows_top_play").empty();

	$("#load_more_users").data("offset", 10);

	if (args.length == 2) {
		let username 	= args[0],
			mode 		= args[1];

		$.get({
			url: `/api/get_user_data/${username}/*/${mode}/10,0`,
			success: function(data) {
				if (data.error) {
					$("#username_input").addClass("invalid");
					return;
				} else {
					$("#username_input").removeClass("invalid");
					renderProfile({
						user_data: data.user_data,
						user_best: data.user_best,
						mode: mode
					});
				}
			}
		}).fail(function(err){
			if (err) throw err;

			console.log("An error has occured!");
		})
	}
}

//==================================================================================
// Analysis
//==================================================================================

function renderAnalysis(mode) {
	switch (mode) {
		case "0":
			$("#taiko, #mania, #catch").addClass("hide");
			if ( $("#standard").attr("class") == "hide" ) {
				$("#standard").toggleClass("hide");
				graphPlayCountData(100, 4, "standardChart100", playerDataStandard);
				graphPlayCountData(1000, 4, "standardChart1000", playerDataStandard);
				graphPlayCountData(10000, 1, "standardChart10000", playerDataStandard);
			}
			break;
		case "1":
			$("#standard, #mania, #catch").addClass("hide");
			if ( $("#taiko").attr("class") == "hide" ) {
				$("#taiko").toggleClass("hide");
				graphPlayCountData(100, 4, "taikoChart100", playerDataTaiko);
				graphPlayCountData(1000, 4, "taikoChart1000", playerDataTaiko);
				graphPlayCountData(10000, 1, "taikoChart10000", playerDataTaiko);
			}
			break;
		case "2":
			$("#standard, #taiko, #mania").addClass("hide");
			if ( $("#catch").attr("class") == "hide" ) {
				$("#catch").toggleClass("hide");
				graphPlayCountData(100, 4, "catchChart100", playerDataCatch);
				graphPlayCountData(1000, 4, "catchChart1000", playerDataCatch);
				graphPlayCountData(9950, 1, "catchChart10000", playerDataCatch);
			}
			break;
		case "3":
			$("#standard, #taiko, #catch").addClass("hide");
			if ( $("#mania").attr("class") == "hide" ) {
				$("#mania").toggleClass("hide");
				graphPlayCountData(100, 4, "maniaChart100", playerDataMania);
				graphPlayCountData(1000, 4, "maniaChart1000", playerDataMania);
				graphPlayCountData(9960, 1, "maniaChart10000", playerDataMania);
			}
			break;
	}
}
/***
 * Graphs play count data
 *
 * @param {max<Int> - E.g: 100 - Will graph the top 100 players.}
 * @param {regressionType<Int> - E.g: 0 (exponential) - 0 --> exponential 1 --> logarithmic 2 --> power 3 --> poly 4 --> linear}
 * @param {id<String> - E.g: #my-chart (Will render data to the canvas #my-chart) - Render data to the provided target id.}
 * @param {modeData<Int> - E.g: Standard (ggrabs standard data) - Gets data for specified mode};
 */
function graphPlayCountData (max, regressionType, id, modeData){
	let chartData = [],
		pairedData = [],
		regressionData = [];

	for (var x_data = 0; x_data < max; x_data++) {
		var y_data = parseInt(modeData[x_data][2].replace(",", ""));
		chartData.push({x: x_data + 1, y: y_data})
		pairedData.push([x_data + 1, parseInt(y_data)]);
	}

	// 0 --> exponential 1 --> logarithmic 2 --> power 3 --> poly 4 --> linear
	let types = [regression.exponential(pairedData), regression.logarithmic(pairedData), regression.power(pairedData), regression.polynomial(pairedData), regression.linear(pairedData)];
	var result = types[regressionType];

	result.points.map((data) => regressionData.push({x: data[0], y: data[1]}));
	var ctx = document.getElementById(id);
	var mode = ""

	if (id.includes("standard")) mode = "standard";
	if (id.includes("taiko")) mode = "taiko";
	if (id.includes("catch")) mode = "catch";
	if (id.includes("mania")) mode = "mania";

	var scatterChart = new Chart(ctx, {
		type: 'scatter',
		data: {
			datasets: [{
				label: "Regression Line",
				data: regressionData,
				backgroundColor: "#95e7f7"
			},{
				label: 'Scatter Dataset',
				data: chartData,
				backgroundColor: "rgba(235,42,149,.5)"
			},
					  ]
		},
		options: {
			title: {
				display: true,
				text: "Top " + max + " players in " + mode
			},
			legend: {
				onClick: function(e, legendItem) {
					e.preventDefault();
				}
			},
			animation: {
				duration: 0,
			},
			hover: {
				animationDuration: 0,
			},
			responsiveAnimationDuration: 0,
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				xAxes: [{
					stacked: false,
					scaleLabel: {
						display: true,
						labelString: 'Rank'
					},
				}],
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Play Count'
					}
				}]
			}
		},
	});
}

/***
 * Graphs country data
 *
 * @param {id<String> - E.g: #my-country-chart - Renders data to the chart that has the given id}
 * @param {modeData<String> - E.g: Standard - Render the data for country with specific mode.}
 */
function graphCountryData(id, modeData) {
	let countries = [],
		countryDataList = [],
		total = 0;
	
	modeData = sortObject(modeData); // sorts object from least to greatest

	var countryData = {} // organizes object, cleans it up
	for (var i = 0; i < Object.keys(modeData).length; i++) {
		countryData[modeData[i].key] = modeData[i].value;
	}

	// makes array of country any, and one of country data
	for (var country in countryData) {
		if (countryData[country]/100 > 1) {
			total += countryData[country];
			countries.push(country);
			countryDataList.push(countryData[country]);
		}
	}

	countries = countries.reverse();
	countryDataList = countryDataList.reverse();

	countries.push("other");
	countryDataList.push(10000 - total);

	let mode = ""
	if (id.includes("Standard")) mode = "standard";
	if (id.includes("Taiko")) mode = "taiko";
	if (id.includes("Catch")) mode = "catch";
	if (id.includes("Mania")) mode = "mania";

	let ctx = document.getElementById(id)
	let color = ["#037971", "#023436", "#00BFB3", "#049A8F", "#03B5AA"];
	var noob = new Chart(ctx, {
		type: 'pie',
		data: {
		  labels: countries,
		  datasets: [{
			//label: countries.reverse(),
			backgroundColor: color,
			data: countryDataList,
			  legend: false
		  }]
		},
		options: {
			legend: {
				display: false,
				onClick: function(e, legendItem) {
					e.preventDefault();
				}
			},
		  responsiveAnimationDuration: 0,
		  title: {
			display: true,
			text: "Top 10,000 " + mode + " country of origin distribution"
		  }
		}
	});
}

//==================================================================================
// Recommendation
//==================================================================================
function isInArray(value, array) {
	return array.indexOf(value) > -1;
}



/***
 * Sorts object from least to greatest.
 *
 * @param {obj<Object>}
 */
function sortObject(obj) {
	var arr = [];
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			arr.push({
				'key': prop,
				'value': obj[prop]
			});
		}
	}
	arr.sort(function(a, b) { return a.value - b.value; });
	//arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
	return arr; // returns array
}
