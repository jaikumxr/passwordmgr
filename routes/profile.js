const express = require("express")
const router = express.Router()
const isLoggedIn = require("../middleware/isLoggedIn")
const User = require("../models/user")

router.get("/profile/:id", isLoggedIn, (req, res)=> {
    res.render("profile", {
        currentUser: req.user,
    });
});

router.get("/profile/edit/:id", isLoggedIn, (req, res)=>{
    res.render("editProfile", {
        currentUser: req.user
    });
});

router.post("/profile/edit/:id", isLoggedIn, (req, res)=>{
    const addObj = {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    }
    User.findByIdAndUpdate(req.params.id , addObj, (err) => {
        if(err){
            console.log(err);
        } else {
            req.flash("success", "Successfully edited account details for "+ req.body.username);
            res.redirect("/home");
        }
    })
})


module.exports = router