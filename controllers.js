const selectTopics = require('./models');

const getTopics = (request, response, next) => {
    selectTopics().then((topics) => {
        response.status(200).send({ topics });
    })
}

module.exports = getTopics