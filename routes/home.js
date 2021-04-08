const express = require('express')
const router = express.Router()
const isLoggedIn = require("../middleware/isLoggedIn")


router.get("/", (req, res) => {
    res.redirect("/home");
});


//index route
router.get("/home", isLoggedIn, (req, res) => {
    res.render("home", {
        currentUser: req.user
    });
});

module.exports = router