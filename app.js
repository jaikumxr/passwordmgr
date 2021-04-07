const methodOverride = require("method-override")
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const flash = require("connect-flash")
const Password = require("./models/password")


// const nodemailer = require("nodemailer");
// let transporter = nodemailer.createTransport({
//     service: "gmail",
//     port: 587,
//     secure: false,
//     auth: {
//         user: "invmgmtassam@gmail.com",
//         pass: "h4JHDpYj3BL3Mfz",
//     },
// });


mongoose.connect("mongodb+srv://burgerxd:iZmBmGdZBXvAGf9i@cluster0.e1l3y.mongodb.net/passwordmgr?retryWrites=true&w=majority", {
// mongoose.connect("mongodb://localhost:27017/passwordmgr", {
    useNewUrlParser: true,
    'useUnifiedTopology': true
});
mongoose.set('useFindAndModify', false);

const connection = mongoose.connection;

// APP CONFIG

app.set("view engine", "ejs")
app.use(express.static("public"))
// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(methodOverride("_method"))
app.use(flash())
app.use(express.json())
app.use(express.urlencoded({limit: '50mb', extended: true}))

// RESTFUL ROUTES

app.use(require("express-session")({
    secret: "masteroogway",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// var newUser = { "username": "admin", "isAdmin": true, "email": "jai@example.com" };
// var password = "admin";
// User.register(newUser, password, function (err, user) {
//     if (err) {
//         console.log(err);
//     }
// });


app.get("/", function (req, res) {
    res.redirect("/home");
});


//index route
app.get("/home", isLoggedIn, function (req, res) {
    res.render("home", {
        currentUser: req.user
    });
});

app.get("/passwords", isLoggedIn, function (req, res) {
    Password.find({ owner: req.user._id }, function (err, passes) {
        console.log(passes);
        res.render("passwords", {
            currentUser: req.user,
            passwords: passes,
            editEnable: false
        })
    })
});

app.get("/passwords/show/:id", isLoggedIn, function (req, res) {
    Password.findById(req.params.id, function (err1, passwd) {
        User.findById(item.owner, function (err2, owner) {
            res.render("showPass", {
                currentUser: req.user,
                password: passwd,
                result: false
            })
        })
    })
})

app.get("/search", isLoggedIn, function (req, res) {
    res.render("search", {
        currentUser: req.user
    })
})

app.post("/search/id", isLoggedIn, function (req, res) {
    const renderItems = []
    try {
        Item.find({ itemid: (req.body.itemid ? req.body.itemid : 0) }, function (err, items) {
            if (err) {
                console.log(err);
            } else {
                items.forEach(function (item) {
                    renderItems.push({ itemObj: item })
                })
                if (items.length > 0) {
                    return res.render("showItem", {
                        currentUser: req.user,
                        items: renderItems,
                        result: true,
                        error: (renderItems.length > 1 ? "Multiple entries found with the same ID. Please update database" : null),
                        success: (renderItems.length == 1 ? "Found 1 item" : null)
                    })
                } else {
                    req.flash("error", "No items found with this ID");
                    return res.redirect("/search");
                }
            }
        })
    }
    catch (err) {
        req.flash("error", "An error occured. Please try again")
        res.redirect("/search")
        console.log(err);
    }
})

app.post("/search/parameters", isLoggedIn, function (req, res) {
    searchObj = {
        "lastModifiedDate": {
            $gt: (new Date(req.body.first)).toJSON(),
            $lt: (new Date(req.body.second)).toJSON()
        },
        itype: req.body.type
    }
    if (req.body.type == "Other") {
        delete searchObj.itype;
    }
    Item.find(searchObj, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            if (result.length > 0) {
                const renderItems = []
                result.forEach(function (item) {
                    renderItems.push({
                        itemObj: item
                    })
                });
                return res.render("showItem", {
                    items: renderItems,
                    success: "No. of items found: " + result.length,
                    result: true
                });
            } else {
                req.flash("error", "No items found. Please check your search criteria.");
                return res.redirect("/search");
            }
        }
    });
});


app.get("/passwords/manage", isLoggedIn, function (req, res) {
    res.render("manage", {
        currentUser: req.user
    })
})

app.get("/passwords/add", isLoggedIn, function (req, res) {
    res.render("new", {
        currentUser: req.user
    })
})

app.post("/passwords/add", isLoggedIn, function (req, res) {
    const newDate = new Date()
    const addObj = {
        itemid: req.body.itemid,
        iname: req.body.iname,
        itype: req.body.itype,
        icount: req.body.icount,
        location: req.body.location,
        publishedDate: newDate,
        lastModifiedDate: newDate,
        addedBy: req.user._id,
        modList: [
            {
                user: req.user._id,
                modDate: newDate
            }
        ]
    }

    Alert.updateMany({}, { items: [], count: 0 }, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log('Cleared alerts.');
        }
    });


    Alert.find({}, (err, alerts) => {
        if (err) {
            console.log(err);
        } else {
            alerts.forEach((alert) => {
                let counter = false;
                if (alert.value == addObj.iname || alert.value == addObj.itype || alert.value == addObj.location) {
                    counter = true;
                }
                if (counter) {
                    Alert.findOneAndUpdate({ value: alert.value }, { $push: { items: addObj.itemid } }, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    })
                }
            })
            function mailer() {
                setTimeout(function () {
                    let subUsers = [];
                    Alert.find({}, function (err, alerts) {
                        if (err) {
                            console.log(err);
                        } else {
                            alerts.forEach(function (alert) {
                                alert.users.forEach((user) => {
                                    subUsers.push({ userid: user, keyword: alert.value, items: alert.items });
                                });
                            });
                            subUsers.forEach(function (item) {
                                console.log(item.userid);
                                User.findById(item.userid, function (err, foundUser) {
                                    if (foundUser) {
                                        console.log("Sending mail to " + foundUser.email);
                                        let mailOptions = {
                                            from: "noreply@ims",
                                            to: foundUser.email,
                                            subject: "New item from your subscription",
                                            text: `
                    Dear ` + foundUser.username + `,
                    This is an auto-generated email.
                    There is a new item from one of your subscribed keyword:  `+ item.keyword + `     
                    Thanks
                    IMS
                    `
                                        }
                                        transporter.sendMail(mailOptions, function (err, data) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("Email Sent");
                                            }
                                        });
                                    } else {
                                        console.log("No user found " + item.userid);
                                    }
                                });
                            });
                        }
                    });
                }, 20000); //a timer of 20 seconds has been added before mailing to ensure that the DB is updated correctly.
            }

            mailer();
        }
    })



    Item.create(addObj, function (err) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong. Please try again");
            res.redirect("/home");
        } else {
            req.flash("success", "Successfully added " + addObj.iname + " to inventory")
            res.redirect("/home");
        }
    })
})

app.get("/passwords/edit", isLoggedIn, function (req, res) {
    Item.find({}, function (err, items) {
        res.render("inventory", {
            currentUser: req.user,
            items: items,
            editEnable: true
        })
    })
})

app.get("/passwords/edit/:id", isLoggedIn, function (req, res) {
    Item.findById(req.params.id, function (err, item) {
        if (err) {
            console.log(err);
        } else {
            res.render("editItem", {
                currentUser: req.user,
                item: item
            })
        }
    })
});

app.put("/passwords/edit/:id", isLoggedIn, function (req, res) {
    const newDate = new Date()
    const addObj = {
        itemid: req.body.itemid,
        iname: req.body.iname,
        itype: req.body.itype,
        icount: req.body.icount,
        location: req.body.location,
        lastModifiedDate: newDate,
        $push: {
            modList: { user: req.user._id, modDate: newDate }
        }
    }
    Item.findByIdAndUpdate(req.params.id, addObj, function (err) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "Successfully edited " + req.body.iname)
            res.redirect("/passwords");
        }
    })
})

app.delete("/paswords/remove/:id", isLoggedIn, function (req, res) {
    Item.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            req.flash("error", "Could not remove password.");
            res.redirect("/passwords")
        } else {
            req.flash("success", "Removed password.");
            res.redirect("/passwords");
        }
    });
});

//AUTH ROUTES

//show signup form
app.get("/signup", function (req, res) {
    res.render("signup");
});

//handle signup logic
app.post("/signup/createuser", function (req, res) {

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
        res.redirect("/signup/createuser");
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
        User.register(newUser, req.body.password, function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/signup/createuser");
            }
            req.flash("success", "Successfully created user: " + req.body.username + ". Please login to continue.");
            res.redirect("/login");
        });
    }
});

app.get("/profile/:id", function (req, res) {
    res.render("profile", {
        currentUser: req.user,
    });
});

//show login form
app.get("/login", function (req, res) {
    res.render("login");
});

//handling login logic
app.post("/login", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true
}), function () { });

//logout ROUTE
app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Successfully logged out");
    res.redirect("/login");
});



//isloggedin
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please log in first")
    res.redirect("/login");
}


//HEROKU CONFIG

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function () {
    console.log("PasswordMGR is up");
});