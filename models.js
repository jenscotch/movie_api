const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Featured: Boolean,
    Actors: [String],
    Year: String,
    ImagePath: String
});

let userSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Birthday: Date,
    Movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}],
    Password: {type: String, required: true},
    Email: {type: String, required: true}
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;