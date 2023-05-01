const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');
    mongoose = require('mongoose');
    Models = require('./models.js');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB', {
    useNewUrlParser: true, useUnifiedTopology: true
});



let users = [
    {
        id: 1,
        name: 'Jen',
        favoriteMovies: []
    },
    {
        id: 2,
        name: 'Frank',
        favoriteMovies: ['Bad Teacher']
    }
];

let movies = [
    {
        title: 'The Bling Ring',
        director: {
            name: 'Sofia Coppola'
        },
        genre: {
            name: 'Drama' 
        },
        imageURL: '#',
        description: 'Inspired by actual events, a group of fame-obsessed teenagers use the internet to track celebrities\' whereabouts in order to rob their homes.'
    },
    {
        title: 'In a World...',
        director: {
            name: 'Lake Bell'
        },
        genre: {
            name: 'Comedy'
        },
        imageURL: '#',
        description: 'An underacheiving voice coach finds herself competing in the movie trailer voice-over profession against her arrogant father and his protege.'
    },
    {
        title: 'Bad Teacher',
        director: {
            name: 'Jake Kasdan'
        },
        genre: { 
            name: 'Comedy'
        },
        imageURL: '#',
        description: 'A lazy, incompetent middle school teacher who hates her job, her students, and her co-workers is forced to return to teaching to make enough money for breast implants after her wealthy fiance dumps her.'
    },
    {
        title: 'The Descendants',
        director: {
            name: 'Alexander Payne'
        },
        genre: {
            name: 'Drama'
        },
        imageURL: '#',
        description: 'A land baron tries to reconnect with his two daughters after his wife is seriously injured in a boating accident.'
    },
    {
        title: 'Young Adult',
        director: {
            name: 'Jason Reitman'
        },
        genre: {
            name: 'Drama'
        },
        imageURL: '#',
        description: 'Soon after her divorce, a fiction writer returns to her home in small-town Minnesota, looking to rekindle a romance with her ex-boyfriend, who is now happily married and has a newborn daughter.'
    }
];

app.use('/documentation', express.static('public'));

//app.METHOD(PATH, HANDLER)

//CREATE

app.post('/users', (req, res) => {
    Users.findOne({ Name: req.body.Name })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Name + 'already exists');
        } else {
            Users
            .create({
                Name: req.body.Name,
                Password: req.body.Password,
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
app.put('/users/:Name', (req, res) => {
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

app.listen(8081, () => {
    console.log('Your app is listening on port 8081.');
});