const express = require("express");
const router = express.Router();

router.get("/", function(req, res){
	res.render("index");	
});

router.get("/about", function(req, res){
	res.render("about");	
});

router.get("/recommendation", function(req, res){
	res.render("recommendation");	
});

router.get("/error", function(req, res){
	res.render("error");	
});

router.get("/bugs", function(req, res){
	res.render("bugs");	
});


module.exports = router;