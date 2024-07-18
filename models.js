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
                return Promise.reject({ status: 404, msg: 'Not Found' });
            };
            return rows[0];
        });
};

function selectAllArticles({ sort_as = 'created_at', order = 'DESC', topic }) {
    const sortColumns = ['article_id', 'title', 'topic', 'author', 'created_at', 'votes', 'comment_count'];
    const orderIn = ['asc', 'desc'];

    if (!sortColumns.includes(sort_as)) {
        sort_as = 'created_at';
    }
    if (!orderIn.includes(order)) {
        order = 'DESC';
    }
    let query = `SELECT
        articles.article_id,
        articles.title,
        articles.topic,
        articles.author,
        articles.created_at,
        articles.votes,        
        articles.article_img_url,

        COALESCE(comment_count, 0) AS comment_count
    FROM articles
    LEFT JOIN (
        SELECT
            article_id,
            COUNT(comment_id) AS comment_count
        FROM comments
        GROUP BY article_id
    ) AS comment_counts
    USING (article_id)
    `;
    const queries = [];

    if (topic) {
        query += ` WHERE articles.topic = $1`;
        queries.push(topic);
    }
    query += ` ORDER BY ${sort_as} ${order};`;

    return db.query(query, queries).then(({ rows: articles }) => articles);
}

function selectArticleComments(article_id) {
    return db.query(`
        SELECT *
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC;
    `, [article_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'Not Found' });
            };
            return rows;
        });
};

module.exports = { selectTopics, selectArticle, selectAllArticles, selectArticleComments };