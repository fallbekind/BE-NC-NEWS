const db = require('./db/connection');

function selectTopics() {
    return db.query('SELECT * FROM topics;')
        .then((result) => {
            return result.rows;
        });
};

function selectArticle(article_id) {
    return db.query('SELECT * FROM articles WHERE article_id = $1', [article_id])
        .then(({ rows }) => {
            if(rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'Not Found' })
            }
            return rows[0];
        });
};

function selectAllArticles() {
    return db.query(
        // query here  
        )
        .then((result) => {
            result.rows.map((article => ({
                ...article,
                comment_count: Number(article.comment_count),
            })))
        });
};

module.exports = { selectTopics, selectArticle, selectAllArticles };

