const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rems');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use('/favicon.ico', express.static('public/res/favicon.ico'));
app.use(session({
    name: 'session',
    secret: 'my_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 1000, // 1hr
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(routes);

app.use((err, req, res, next) => {
    return res.send('Internal Server Error');
});

app.listen(3000, () => console.log('Server is runngin on port 3000'));