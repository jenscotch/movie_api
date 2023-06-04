const mongoose = require('mongoose'),
        bcrypt = require('bcrypt');

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
    Image: String
});

let userSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Birthday: Date,
    Movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}],
    Password: {type: String, required: true},
    Email: {type: String, required: true}
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;