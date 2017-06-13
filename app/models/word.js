var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

var wordScheme = new Schema({
    word: {
        type:String,
        required:[true,"wordRequired"],
        minlength:[1,"tooShort"]
    },
    mfcc: {
        type:[[Number]],
        required:[true,"mfccRequired"]
    }
});
module.exports.Schema = wordScheme;
wordScheme.plugin(autoIncrement.plugin, {model: 'Word', field: 'id', startAt: 0});
module.exports = mongoose.model("Word", wordScheme);