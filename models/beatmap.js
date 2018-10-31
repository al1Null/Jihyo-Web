const mongoose = require("mongoose");

let beatmapSchema = mongoose.Schema({
    approved :  String ,
    approved_date :  String ,
    last_update :  String ,
    artist :  String ,
    beatmap_id :  String ,
    beatmapset_id :  String ,
    bpm :  String ,
    creator :  String ,
    difficultyrating :  String ,
    diff_size :  String ,
    diff_overall :  String ,
    diff_approach :  String ,
    diff_drain :  String ,
    hit_length :  String ,
    source :  String ,
    genre_id :  String ,
    language_id :  String ,
    title :  String ,
    total_length :  String ,
    version :  String ,
    file_md5 :  String ,
    mode :  String ,
    tags :  String ,
    favourite_count :  String ,
    playcount :  String ,
    passcount :  String ,
    max_combo :  String 
});

let Beatmap = mongoose.model("Beatmap", beatmapSchema);

module.exports = Beatmap;