const db = require('./db/connection');

function selectTopics() {
    return db.query('SELECT * FROM topics;')
        .then((result) => {
            return result.rows;
        });
};

function selectArticleById(article_id) {
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
    const orderIn = ['ASC', 'DESC'];

    if (!sortColumns.includes(sort_as) || !orderIn.includes(order)) {
        return Promise.reject({
          status: 400,
          message: "Bad Request",
        });
    }

    return selectTopics().then((topics) => {
        const validTopics = topics.map(topic => topic.slug);

        if (topic && !validTopics.includes(topic)) {
            return Promise.reject({
                status: 404,
                message: 'Not Found'
            });
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

    return db.query(query, queries)

    }).then(({ rows: articles }) => articles);
};


function selectArticleCommentById(article_id) {
   
    return db.query(`
        SELECT 1 FROM articles WHERE article_id = $1;
    `, [article_id])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Not Found' });
        }
        return db.query(`
            SELECT *
            FROM comments
            WHERE article_id = $1
            ORDER BY created_at DESC;
        `, [article_id]);
    })
    .then(({ rows }) => {
        return rows;
    });
};

function addCommentToArticle(article_id, username, body) {
    const postQuery = `INSERT INTO comments (article_id, author, body)
        VALUES ($1, $2, $3) RETURNING *;`

        return selectArticleById(article_id)
        .then(() => {
            return db.query(postQuery, [article_id, username, body])
        })  

        .then(({ rows }) => {
            return rows[0]
        });
};

function updateArticle(article_id, alt_votes) {
    const patchQuery = `UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;`

        return db.query(patchQuery, [alt_votes, article_id])
        .then(({ rows: articles }) => articles[0]);
};

function removeCommentById(comment_id) {

    if(isNaN(comment_id)) {
        return Promise.reject({ status: 400, message: 'Bad Request' });
    }
    return db.query('SELECT 1 FROM comments WHERE comment_id = $1', [comment_id])
        .then(result => {
            if (result.rowCount === 0) {
                return Promise.reject({ status: 404, message: 'Not found' });
            }
            return db.query('DELETE FROM comments WHERE comment_id = $1', [comment_id]);
        });    
};

function selectAllUsers() {
    return db.query(`SELECT * FROM users;`)
    .then(({ rows: users }) => users);
};

module.exports = { selectTopics, selectArticleById, selectAllArticles, selectArticleCommentById, addCommentToArticle, updateArticle, removeCommentById, selectAllUsers };