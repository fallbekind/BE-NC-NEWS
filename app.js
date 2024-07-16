const express = require('express');
const app = express();
const { getTopics, getEndPoints } = require('./controllers');

app.get('/api/topics', getTopics);

app.get('/api', getEndPoints);

//404 unknown URL

app.use((request, response, next) => {
    response.status(404).send({ msg: 'Not Found' });
});

app.use((err, request, response, next) => {
    if (err.code === '22P02') {
        response.status(400).send({ msg: 'Bad Request' });
    } else if (err.status && err.msg) {
        response.status(err.status).send({ msg: err.msg })
    } else {
        next(err);
        }
});

module.exports = app;