const express = require('express'),
    morgan = require('morgan');


const app = express();

let topMovies = [
    {
        title: 'The Bling Ring (2013)',
        director: 'Sofia Coppola'
    },
    {
        title: 'In a World... (2013)',
        director: 'Lake Bell'
    },
    {
        title: 'Bad Teacher (2011)',
        director: 'Jake Kasdan'
    },
    {
        title: 'The Descendants (2011)',
        director: 'Alexander Payne'
    },
    {
        title: 'Young Adult (2011)',
        director: 'Jason Reitman'
    }
];

const accessLogStream = fs.createWriteStream (path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));

app.use('/documentation', express.static('public'));

//app.METHOD(PATH, HANDLER)
//GET requests
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super secret content.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});