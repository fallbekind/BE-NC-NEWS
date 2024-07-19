const { selectTopics, selectArticleById, selectAllArticles, selectArticleCommentById, addCommentToArticle, updateArticle, removeCommentById, selectAllUsers } = require('./models');
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

const getArticleById = (request, response, next) => {
    const { article_id } = request.params;

    if (isNaN(article_id)) {
        return response.status(400).send({ msg: 'Bad Request' });
    }
    selectArticleById(article_id)
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
            if (err.status === 400 || err.status === 404) {
                response.status(err.status).send({ message: err.message });
            } else {
            next(err);
            }
        });
};

const getArticleCommentById = (request, response, next) => {
    const { article_id } = request.params;

    if (isNaN(article_id)) {
        return response.status(400).send({ msg: 'Bad Request' });
    }

    selectArticleCommentById(article_id)
        .then((comments) => {
            response.status(200).send({ comments });
        })
        .catch((err) => {
            next(err);
        });
};

const addComment = (request, response, next) => {

    const { article_id } = request.params;
    const { username, body } = request.body;

    addCommentToArticle(article_id, username, body).then((comment) => {

        response.status(201).send({ comment })
    }).catch((err) => {
        next(err);
    });
};

const patchArticle = (request, response, next) => {
    const { article_id } = request.params;
    const { alt_votes } = request.body;

    if (isNaN(article_id)) {
        return response.status(400).send({ message: 'Bad Request' });
    }

    if (typeof alt_votes !== 'number') {
        return response.status(400).send({ message: 'Bad Request' });
    }

    updateArticle(article_id, alt_votes)
        .then((article) => { 
        
        if (!article) {
            return response.status(404).send({ message: 'Not Found' });
        }
        response.status(200).send({ article })
    }).catch((err) => {
        next(err);
    });
};

const deleteCommentById = (request, response, next) => {
    const { comment_id } = request.params;

    removeCommentById(comment_id)
    .then(() => response.status(204).send())
    
    .catch((err) => {
        if (err.status) {
            response.status(err.status).send({ message: err.message });
        } else {
            next(err);
        }
    });
};

const getAllUsers = (request, response, next) => {
    selectAllUsers().then((users) => {
        response.status(200).send({ users })
    })
    .catch((err) => {
        next (err);
    });
}

module.exports = { getTopics, getEndPoints, getArticleById, getAllArticles, getArticleCommentById, addComment, patchArticle, deleteCommentById, getAllUsers };