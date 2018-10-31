const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

class OsuScraper {
    constructor(filename, mode) {
        this.filename = filename;
        this.mode = mode;
        this.results = {};
    }

    four_point_data(page) {
        const request = async (url, options) => {
            return new Promise((resolve, reject) => {
                require('request')(url, options, (err, http, body) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve({ http, body });
                });
            });
        };

        const page_limit = [...Array(page).keys()].slice(1);

        /***
         * Builds batches out of some list.
         */
        function makeBatches(list, batchSize) {
            // Setup our list to contain the output batches.
            const batches = [];

            // While we've more elements to pull, keep on batching.
            // Could be rewritten with reduce.
            for (let i = 0; i < list.length; i += batchSize) {
                batches.push(list.slice(i, i + batchSize));
            }

            // Return our batches.
            return batches;
        }

        /***
         * Retrieves basic user data for the given username.
         *
         * @returns {Promise<{user_data: any}>}
         */
        async function getUserData(page) {
            const { http, body } = await request(`https://osu.ppy.sh/rankings/fruits/performance?page=${page}`);

            var $ = cheerio.load(body);
        	let datas = [];

        	for (var i = 0; i < 50; i++) {
        		let name = $(".ranking-page-table__row").eq(i).find("td").eq(1).text().trim(),
        			accuracy = $(".ranking-page-table__row").eq(i).find("td").eq(2).text().trim(),
        			playCount = $(".ranking-page-table__row").eq(i).find("td").eq(3).text().trim(),
        			performance = $(".ranking-page-table__row").eq(i).find("td").eq(4).text().trim();
        		datas.push([name, accuracy, playCount, performance]);
        	}

        	return datas;
            //JSON.parse($("#json-user").html())
        }

        /**
         * Retrieves information for the given list of usernames in async "parallel," returning a
         * list of objects in the format: `{ username: string, data: Object }`.
         *
         * @returns {Promise<[{username: string, data: Object}]>}
         */
        async function getUsersData(page_limit) {
            // Issue a new data retrieval for each user, waiting on them in "parallel".
            const data = await Promise.all(page_limit.map(getUserData));

            // We've got all our data, so let's correlate the values with usernames, so the receiver
            // doesn't have to bother with that!
            return data.map((v) => v);
        }

        /**
         * Retrieves the user data for all the given batches (with some logging extras).
         */
        async function getBatchesData(batches) {
            // Setup an array to hold all the data objects from our batches.
            const allUsersData = [];

            // Define the batch number, so we can keep track of progress.
            let batchNum = 1;

            // For each batch, run the data retrieval function and add to our list, with some logging.
            for (const batch of batches) {
                // Retrieve the data for this batch...
                const data = await getUsersData(batch);

                // Append all the user info objects to our data list.
                // (Note: could use .concat for bit better performance, but this prohibits const).
                allUsersData.push(...data);

                // Log out some progress.
                console.log(`Completed batch ${batchNum} of ${batches.length} – ${(batchNum / batches.length * 100).toFixed(2)}% done!`);

                // Increment our current batch count.
                batchNum++;
            }

            // Return our data list.
            return allUsersData;
        }

        // Let's make batches of 50 requests at a time. That's sufficient to not kill the server :3
        getBatchesData(makeBatches(page_limit, 1)).then(data => {
            //console.log('users data =>', data);
            // Write our data file out synchronously.
            // If using on production server code, definitely switch to CB/promise version.
            fs.writeFile(`datas/${this.filename}.json`, JSON.stringify(data, null, 2), function(err){
                if (err) throw err;
                console.log("Success");
            });
        }).catch(err => {
            console.error('Failed to retrieve data for all batches:', err);
        });
    }
}
