var mongoose = require("mongoose");

var passwordSchema = new mongoose.Schema({
    pname: String,
    password: String,
    comments: {type: String, default: ""},
    publishedDate: Date,
    lastModifiedDate: Date,
    owner: {type:mongoose.Types.ObjectId, default:undefined}
});

module.exports = mongoose.model("Password", passwordSchema);
