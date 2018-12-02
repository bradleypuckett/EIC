var mongoose = require("mongoose");

var contractSchema = mongoose.model(
	"Contract",
	new mongoose.Schema({
        title: {type: String, required: true, max: 100},
        pay: {type: String, required: true, max: 100},
        location: {type: String, required: true, max: 100},
        creator: {type: String, required: true, max: 100},
        related_skills: [{type: String, required: false, max: 100}],
        creation_date: {type: String, required: true, max: 100},
        description: {type: String, required: true, max: 2000}
    })
);

module.exports = mongoose.model("Contract");
