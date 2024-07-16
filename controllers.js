const { selectTopics, selectArticle } = require('./models');
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
    selectArticle(article_id)
    .then((article) => {
        response.status(200).send({ article });
    }).catch((err) => {
        next(err);
    });
};

module.exports = { getTopics, getEndPoints, getArticle };