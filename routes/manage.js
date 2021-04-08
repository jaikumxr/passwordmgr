const express = require('express')
const router = express.Router()
const User = require("../models/user")
const Password = require("../models/password")
const isLoggedIn = require("../middleware/isLoggedIn")



//Show passwords list
router.get("/passwords", isLoggedIn, (req, res)=> {
    Password.find({ owner: req.user._id }, (err, passes) => {
        console.log(passes);
        res.render("passwords", {
            currentUser: req.user,
            passwords: passes,
            editEnable: false
        })
    })
});


//Show specific password details (except the password)
router.get("/passwords/show/:id", isLoggedIn, (req, res)=> {
    Password.findById(req.params.id, (err1, passwd)=> {
        User.findById(passwd.owner, (err2, owner)=> {
            res.render("showPass", {
                currentUser: req.user,
                password: [passwd],
            })
        })
    })
})


router.get("/passwords/manage", isLoggedIn, (req, res) => {
    res.render("manage", {
        currentUser: req.user
    })
})

router.get("/passwords/add", isLoggedIn, (req, res) => {
    res.render("new", {
        currentUser: req.user
    })
})

//add new password
router.post("/passwords/add", isLoggedIn, (req, res) => {
    const newDate = new Date()
    const addObj = {
        pname: req.body.pname,
        password: req.body.password,
        comments: req.body.comments,
        publishedDate: newDate,
        lastModifiedDate: newDate,
        owner: req.user._id,
    }

    Password.create(addObj, (err)=> {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong. Please try again");
            res.redirect("/home");
        } else {
            req.flash("success", "Successfully added " + addObj.pname + " to your passwords")
            res.redirect("/home");
        }
    })
})

router.get("/passwords/edit", isLoggedIn, (req, res)=> {
    Password.find({}, (err, items)=> {
        res.render("inventory", {
            currentUser: req.user,
            items: items,
            editEnable: true
        })
    })
})

//edit password
router.get("/passwords/edit/:id", isLoggedIn, (req, res)=> {
    Password.findById(req.params.id, (err, passwd)=> {
        if (err) {
            console.log(err);
        } else {
            res.render("editPass", {
                currentUser: req.user,
                passwd: passwd
            })
        }
    })
});

router.put("/passwords/edit/:id", isLoggedIn, (req, res)=> {
    const newDate = new Date()
    const addObj = {
        pname: req.body.pname,
        comments: req.body.comments,
        lastModifiedDate: newDate,
    }
    if(req.body.password.length>0){
        addObj.password = req.body.password
    }
    Password.findByIdAndUpdate(req.params.id, addObj, (err)=> {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "Successfully edited password for " + req.body.pname)
            res.redirect("/passwords");
        }
    })
})

router.delete("/passwords/remove/:id", isLoggedIn, (req, res)=> {
    Password.findByIdAndRemove(req.params.id, (err)=> {
        if (err) {
            req.flash("error", "Could not remove password.");
            res.redirect("/passwords")
        } else {
            req.flash("success", "Removed password.");
            res.redirect("/passwords");
        }
    });
});

module.exports = router