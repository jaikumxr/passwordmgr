const methodOverride = require("method-override")
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const passport = require("passport")
const User = require("./models/user")
const flash = require("connect-flash")
const LocalStrategy = require("passport-local")

const signInRoutes = require("./routes/signin")
const signUpRoutes = require("./routes/signup")
const homeRoute = require("./routes/home")
const manageRoute = require("./routes/manage")
const profileRoute = require("./routes/profile")
const mailRoutes = require("./routes/mailPassword")

//MongoDB config - comment either 19 or 20

mongoose.connect("mongodb+srv://burgerxd:iZmBmGdZBXvAGf9i@cluster0.e1l3y.mongodb.net/passwordmgr?retryWrites=true&w=majority", {
// mongoose.connect("mongodb://localhost:27017/passwordmgr", {
    useNewUrlParser: true,
    'useUnifiedTopology': true
});
mongoose.set('useFindAndModify', false);

// APP CONFIG

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(methodOverride("_method"))
app.use(flash())
app.use(express.json())
app.use(express.urlencoded({limit: '50mb', extended: true}))

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

app.use((req, res, next)=> {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(homeRoute) //Home path

app.use(manageRoute) //Managing passwords

app.use(profileRoute) //Profile routes

app.use(signUpRoutes) //Signup routes

app.use(signInRoutes) //Login routes

app.use(mailRoutes) //password mailer

//HEROKU CONFIG

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, () => {
    console.log("PasswordMGR is up");
});
