const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
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

const cors = require('cors');

let allowedOrigins = ['http://localhost:8081', 'https://jens-movie-api.herokuapp.com/', 'http://localhost:1234'];

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

app.post('/users', 
[
    check('Name', 'Name is required').isLength({min: 5}),
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
                Birthday: req.body.Birthday
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

//POST a movie to user's favs list
app.post('/users/:Name/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Name: req.params.Name }, {
        $push: { Movies: req.params.MovieID },
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error:' + err)
            } else {
                res.json(updatedUser);
            }
    });
});

//UPDATE
app.put('/users/:Name', 
[
    check('Name', 'Name is required').isLength({min: 5}),
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
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
    }
    },
    { new: true },
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error:' + err);
        } else {
            res.json(updatedUser);
        }
    });
});


//READ
//GET all movies
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

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
});


//DELETE user by username
app.delete('/users/:Name', (req, res) => {
    Users.findOneAndRemove({ Name: req.params.Name })
    .then((user) => {
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

