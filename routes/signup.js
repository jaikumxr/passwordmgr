const express = require('express')
const router = express.Router()
const User = require("../models/user")

//show signup form
router.get("/signup", (req, res)=> {
    res.render("signup");
});

//handle signup logic
router.post("/signup/createuser", (req, res)=> {

    const { username, password, email, firstName, lastName, confirmpassword } = req.body;
    let errors = [];

    if (!username || !password || !email) {
        errors.push({ msg: 'Please enter all required fields' });
    }

    var paswd = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;

    if (!password.match(paswd)) {
        errors.push({ msg: "Enter a password between 7 to 15 characters which contains at least one numeric digit and a special character." });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        errors.push({ msg: "Please enter a valid email" })
    }

    if (password != confirmpassword) {
        errors.push({ msg: "Both passwords are different. Kindly enter same password in the Confirm Password field." })
    }

    if (errors.length > 0) {
        req.flash("error", errors[0].msg);
        res.redirect("/signup/");
    } else {
        var newUser = new User({
            username: req.body.username
        });
        if (req.body.role === "admin") {
            newUser.isAdmin = "true"
        }
        newUser.lastName = lastName;
        newUser.firstName = firstName;
        newUser.email = email;
        User.register(newUser, req.body.password, (err)=> {
            if (err) {
                console.log(err);
                return res.redirect("/signup");
            }
            req.flash("success", "Successfully created user: " + req.body.username + ". Please login to continue.");
            res.redirect("/login");
        });
    }
});

module.exports = router