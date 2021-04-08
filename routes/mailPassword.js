const express = require('express')
const router = express.Router()
const isLoggedIn = require("../middleware/isLoggedIn")
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Password = require('../models/password');

let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
        user: "passmgr2021@gmail.com",
        pass: "fogjaR-dowmep-tifpy2",
    },
});
router.post("/passwords/mail/:id", isLoggedIn, (req, res)=>{
    let passwd = {}
    Password.findById(req.params.id, async (err, password)=>{
        passwd = password
    }).then(()=>{
        User.findById(passwd.owner , function(err, foundUser){
            if(foundUser){
              console.log("Sending mail to "+foundUser.email);
              let mailOptions = {
                from: "noreply@PasswordMGR",
                to: foundUser.email,
                subject: "Password for "+passwd.pname,
                text: `
                Dear ` +foundUser.username +`,
                This is an auto-generated email.
                The password for your requested website, i.e. `+ passwd.pname +` is:    
                `+passwd.password+`
                
                Thanks
                PasswordMGR 2021
                `  
              }
              transporter.sendMail(mailOptions, function(err, data){
                if(err){
                    console.log(err);
                } else {
                    console.log("Email Sent");
                }
                req.flash("success", "Mailed password to: "+foundUser.email)
                res.redirect("/home")
              });
            } else {
              console.log("No user found "+item.userid);
            }
          });
    })
    
})

module.exports = router