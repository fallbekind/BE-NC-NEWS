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

function selectAllArticles({ sort_as = 'created_at', order = 'desc', topic }) {
    const validSortColumns = ['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'comment_count'];
    const validOrderOptions = ['asc', 'desc'];

    if (!validSortColumns.includes(sort_as)) {
        sort_as = 'created_at';
    }

    if (!validOrderOptions.includes(order.toLowerCase())) {
        order = 'desc';
    }

    let query = `
        SELECT
            articles.author,
            articles.title,
            articles.article_id,
            articles.topic,
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

    const queryParams = [];

    if (topic) {
        query += ` WHERE articles.topic = $1`;
        queryParams.push(topic);
    }

    query += ` ORDER BY ${sort_as} ${order.toUpperCase()};`;

    return db.query(query, queryParams).then(({ rows: articles }) => articles);
}

module.exports = { selectTopics, selectArticle, selectAllArticles };
