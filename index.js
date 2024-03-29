const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    cors = require('cors');
    mongoose = require('mongoose'),
    Models = require('./models.js');


const app = express();
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

app.get('/', (req, res) => {
    res.send('Welcome to my API');
});

app.use('/documentation', express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('common'));
app.use(cors());

let allowedOrigins = ['http://localhost:8081', 'https://jens-movie-api.herokuapp.com', 'http://localhost:4200', 'https://jensmovieapp.netlify.app', 'https://jenscotch.github.io/myFlix-Angular-client', 'https://cool-bublanina-cb32af.netlify.app'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let message = 'The CORS policy for this application doesn\'t allow access from origin' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));

//MUST BE AFTER bodyParser!
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

mongoose.connect( process.env.CONNECTION_URI, { 
    useNewUrlParser: true, useUnifiedTopology: true })
    .catch(error => handleError(error));


//app.METHOD(PATH, HANDLER)

//CREATE
/**
 * create a new user
 */
app.post('/users', 
[
    check('Name', 'Name is required').isLength({min: 3}),
    check('Name', 'Name contains non alpha numeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty()
 
], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Name: req.body.Name })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Name + 'already exists');
        } else {
            Users
            .create({
                Name: req.body.Name,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
            })
            .then((user) => {res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error:' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error:' + error);
    });
});



//UPDATE
/**
 * edit user details
 */
app.put('/users/:Name', 
[
    check('Name', 'Name is required').isLength({min: 3}),
    check('Name', 'Name contains non alpha numeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty()
], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({Name: req.params.Name}, { $set:
    {
        Name: req.body.Name,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
    }
    },
    { new: true })
    .then(updatedUser => {
        res.json(updatedUser);
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('Error: ' + err);
    });

    });


//READ
//GET all movies
/**
 * get all movies
 */
app.get('/movies', (req, res) => {
    Movies.find()
    .then((movie) => {
        res.status(201).json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//GET specific movie info by title
/**
 * get certain movie by title
 */
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//GET movies based on genre name
/**
 * get movie's genre
 */
app.get('/movies/genre/:Name', (req, res) => {
    Movies.find({ 'Genre.Name': req.params.Name })
    .then((movies) => {
        res.json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//GET movies based on director name
/**
 * get movie's director info
 */
app.get('/movies/director/:Name', (req, res) => {
    Movies.find({ 'Director.Name': req.params.Name })
    .then((movies) => {
        res.json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//GET all users
/**
 * get all user's info
 */
app.get('/users', (req, res) => {
    Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error:' + err);
    });
});

//GET a user by name
/**
 * get certain user by name
 */
app.get('/users/:Name', (req, res) => {
    Users.findOne({ Name: req.params.Name})
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error:' + err);
    });
});

// add movie to user's list of favorites
/**
 * add movie to user's list of favorite movies
 */
app.post('/users/:Name/movies/:MovieId', (req, res) => {
    const Name = req.params.Name;
    const movieID = req.params.MovieId;

    Users.findOneAndUpdate({ Name: Name }, {
        $push: { Movies: movieID }
    }, {new: true})
    .then(updatedUser => {
        res.json(updatedUser);
    })
    .catch(err => {
        console.error(err);
        res.status(500).end('Error: ' + err);
    });
});



//DELETE movie from users favs
/**
 * delete movie from user's favorite movies
 */
app.delete('/users/:Name/movies/:MovieId', (req, res) => {
    const Name = req.params.Name;
    const movieID = req.params.MovieId;

    Users.findOneAndUpdate({ Name: Name }, {
        $pull: { Movies: movieID }
    }, {new: true}) //this line makes sure that the updated doc is returned
    .then(updatedUser => {
        res.json(updatedUser);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});


//DELETE user by username
/**
 * delete user's info using user's name
 */
app.delete('/users/:Name', (req, res) => {
    Users.findOneAndRemove({ Name: req.params.Name })
    .then(user => {
        if (!user) {
            res.status(400).send(req.params.Name + ' was not found');
        } else {
            res.status(200).send(req.params.Name + ' was deleted');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8081;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port ' + port);
});

