const express = require('express');
const app = express();
const { getTopics, getEndPoints, getArticleById, getAllArticles, getArticleComments, addComment, patchArticle, deleteComment, getAllUsers } = require('./controllers');

app.use(express.json());

//QUERIES

app.get('/api/topics', getTopics);

app.get('/api', getEndPoints);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getAllArticles);

app.get('/api/articles/:article_id/comments', getArticleComments);

app.post('/api/articles/:article_id/comments', addComment);

app.patch('/api/articles/:article_id', patchArticle);

app.delete('/api/comments/:comment_id', deleteComment);

app.get('/api/users', getAllUsers);

//ERRORS

app.all('*', (request, response) => {
    response.status(404).send({ msg: 'Not Found' });
});

app.use((err, request, response, next) => {
    if (err.code === '22P02' || err.code === '23502') {
        response.status(400).send({ msg: 'Bad Request' });
    } else if 
        (err.code === '23503') {
            response.status(404).send({ msg: 'Username Does Not Exist'})
        }
        else {
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