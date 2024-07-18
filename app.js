const express = require('express');
const app = express();
const { getTopics, getEndPoints, getArticle, getAllArticles, getArticleComments } = require('./controllers');

//QUERIES

app.get('/api/topics', getTopics);

app.get('/api', getEndPoints);

app.get('/api/articles/:article_id', getArticle)

app.get('/api/articles', getAllArticles);

app.get('/api/articles/:article_id/comments', getArticleComments);

//ERRORS

app.all('*', (request, response) => {
    response.status(404).send({ msg: 'Not Found' });
});

app.use((err, request, response, next) => {
    if (err.code === '22P02' || err.code === '23502') {
        response.status(400).send({ msg: 'Bad Request' });
    } else {
        next(err);
    }
});

app.use((err, request, response, next) => {
    if(err.status && err.msg) {
        response.status(err.status).send({ msg: err.msg })
    } else {
        next(err);
    }
});

app.use((err, request, response) => {
    response.status(500).send({ msg: 'Internal Server Error' });
});

module.exports = app;