const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
require('jest-sorted');

const { topicData, articleData, commentData, 
    userData } = require('../db/data/test-data');
const endPoints = require('../endpoints');

afterAll(() => db.end());
beforeEach(() => 
    seed({ topicData, articleData, commentData, userData }));

describe('GET', () => {
    describe('/api/topics', () => {
        test('responds with status code 200 and an array of topic objects with defined keys', () => {
            return request(app)
                .get('/api/topics')
                .expect(200)
                .then(response => {
                    expect(response.body.topics.length).toBe(topicData.length);

                response.body.topics.forEach((topic) => {
                    expect(topic).toHaveProperty('slug');
                    expect(topic).toHaveProperty('description');
                });
            });        
        });
        test('responds with status code 404 and error message Not Found when passed an invalid path', () => {
            return request(app)
                .get('/api/tonics')
                .expect(404)
                .then(response => {
                    expect(response.body.msg).toBe('Not Found');
                });
        });
    });
    describe('/api', () => {
        test('responds with status 200 and an object of available endpoints', () => {
            return request(app)
                .get('/api')
                .expect(200)
                .then(({ body }) => {
                    expect(body.endpoints).toEqual(endPoints);
                });
        });
    });
    describe('/api/:article_id', () => {
        test('responds with status 200 and the defined article when passed a valid article id', () => {
            return request(app)
                .get('/api/articles/1')
                .expect(200)
                .then(response => {
                    const article = response.body.article;
                    expect(article).toEqual({ 
                        article_id: 1,
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: '2020-07-09T20:11:00.000Z',
                        votes: 100,
                        article_img_url: 
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700", });
                }); 
        });
        test('responds with status 404 and an error message when passed an article id that does not exist', () => {
            return request(app)
                .get('/api/articles/500')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe('Not Found');
                });
        });
        test('responds with status 400 and error message when passed an invalid article id type', () => {
            return request(app)
                .get('/api/articles/fifteen')
                .expect(400)
                .then(({ body }) => {
                    expect(body.msg).toBe('Bad Request');
                });
        });
    });

    describe('/api/articles', () => {
        test('responds with status 200 and an array of article objects in descending order of date created', () => {
            return request(app)
                .get('/api/articles')
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy('created_at', { descending: true });
                });
        });
        test(`responds with an array of article objects, each containing the following properties: author, title, 
            article_id, topic, created_at, votes, article_img_url and comment_count `, () => {
            return request(app)
                .get('/api/articles')
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles.length).toBe(13);
                    articles.forEach((article) => {

                    expect(article).not.toHaveProperty('body');
                    const expectedProperties = ['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count'];
                    expectedProperties.forEach(property => expect(article).toHaveProperty(property));
                });
            });
        });
        test('responds with status 404 and an error message when passed an invalid url', () => {
            return request(app)
                .get('/api/particles')
                .expect(404)
                .then(({ body: { msg } }) =>
                    expect(msg).toBe('Not Found'));
        });
    });

    describe('GET /api/articles/:article_id/comments', () => {
        test('responds with status 200 and an array of comments for the given article_id, sorted by most recent first', () => {
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body: { comments } }) => {
                
              expect(comments.length).toBeGreaterThan(0);
              expect(comments).toBeSortedBy('created_at', { descending: true });
    
                comments.forEach(comment => {
                    expect(comment).toHaveProperty('comment_id');
                    expect(comment).toHaveProperty('body');
                    expect(comment).toHaveProperty('votes');
                    expect(comment).toHaveProperty('author');
                    expect(comment).toHaveProperty('article_id');
                    expect(comment).toHaveProperty('created_at');                                               
                });
            });
        });
        test('responds with status 404 and an error message when passed an article_id that does not exist', () => {
            return request(app)
                .get('/api/articles/200/comments')
                .expect(404)
                .then(({ body: { msg } }) => 
                    expect(msg).toBe('Not Found'));
        });   
        test('responds with status 400 and an error message when passed an invalid article_id', () => {
            return request(app)
                .get('/api/articles/fiver/comments')
                .expect(400)
                .then(({ body: { msg } }) => 
                    expect(msg).toBe('Bad Request'));
        });
    });
});
