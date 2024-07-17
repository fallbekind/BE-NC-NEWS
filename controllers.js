const { selectTopics, selectArticle, selectAllArticles } = require('./models');
const endPoints = require('./endpoints.json');

const getTopics = (request, response, next) => {
    selectTopics().then((topics) => {
        response.status(200).send({ topics });
    })
    .catch((err) => {
        next(err);
    });
};

const getEndPoints = (request, response) => { 
    response.status(200).send({ endpoints: endPoints });
};

const getArticle = (request, response, next) => {
    const { article_id } = request.params;

    if (isNaN(article_id)) {
        return response.status(400).send({ msg: 'Bad Request' });
    }
    selectArticle(article_id)
    .then((article) => {
        response.status(200).send({ article });
    }).catch((err) => {
        next(err);
    });
};

const getAllArticles = (request, response, next) => {
    const { sort_as, order, topic } = request.query;

    selectAllArticles({ sort_as, order, topic })
        .then((articles) => {
            response.status(200).send({ articles });
        })
        .catch((err) => {
            next(err);
        });
};

module.exports = { getTopics, getEndPoints, getArticle, getAllArticles };