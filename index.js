const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');


const app = express();

app.use(bodyParser.json());

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
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need names')
    }
});

app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('no such user')
    }
});

//UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }
});


//READ
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

app.get('/movies/:title', (req, res) => {
    const title = req.params.title;
    const movie = movies.find(movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie')
    }
});

app.get('/movies/genre/:genreName', (req, res) => {
    const genreName = req.params.genreName;
    const genre = movies.find(movie => movie.genre.name === genreName).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no such genre')
    }
});

app.get('/movies/director/:directorName', (req, res) => {
    const directorName = req.params.directorName;
    const director = movies.find(movie => movie.director.name === directorName).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no such director')
    }
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

app.delete('/users/:id/', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user')
    }
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8081, () => {
    console.log('Your app is listening on port 8081.');
});