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
        test('responds with status 200 and an array of all article objects in descending order of date created', () => {
            return request(app)
                .get('/api/articles')
                .expect(200)
                .then(({ body: { articles } }) => {
                    expect(articles).toBeSortedBy('created_at', { descending: true });
                });
        });
        test(`responds with an array of all article objects, each containing the following properties: author, title, 
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
        test('responds with status 200 and an array of all article objects ordered by a specified column', () => {
            return request(app)
            .get('/api/articles?sort_as=author')
            .expect(200)
            .then(({ body: { articles } }) => {
                expect(articles.length).toBe(13)
                expect(articles).toBeSortedBy('author', { descending: true })
            });
        });
        test('responds with status 200 and an array of all article objects ordered in a specified direction', () => {
            return request(app)
            .get('/api/articles?order=ASC')
            .expect(200)
            .then(({ body: { articles } }) => {
                expect(articles.length).toBe(13)
                expect(articles).toBeSortedBy('created_at', { descending: false });
            });
        });
        test('responds with status 200 and an array of article topics filtered by a specified topic', () => {
            return request(app)
            .get('/api/articles?topic=cats')
            .expect(200)
            .then(({ body: { articles } }) => {
                expect(articles.length).toBe(1)
                articles.forEach(article => {
                    expect(article).toHaveProperty("topic", "cats");               
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
        test('responds with status 400 and an error message when passed an invalid sort_as query', () => {
            return request(app)
            .get('/api/articles?sort_as=coolness')
            .expect(400)
            .then(({ body: { message } }) => 
                expect(message).toBe('Bad Request'));
        });
        test('responds with status 400 and an error message when passed an invalid order query', () => {
            return request(app)
            .get('/api/articles?order=sideways')
            .expect(400)
            .then(({ body: { message } }) => 
                expect(message).toBe('Bad Request'));
        });
    });
    describe('/api/articles/:article_id/comments', () => {
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
                    expect(comment).toHaveProperty('created_at');                                               
                });
            });
        });
        test('responds with status 200 and an empty array if there are no comments related to the given article', () => {
            return request(app)
            .get('/api/articles/2/comments')
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments).toEqual([]);
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
    describe('/api/users', () => {
        test('responds with status 200 and an array of objects with the following properties: username, name and avatar_url', () => {
            return request(app)
            .get('/api/users')
            .expect(200)
            .then(({ body: { users } }) => {
                expect(users.length).toBe(4);

                users.forEach((user) => {
                const expectedProperties = ['username', 'name', 'avatar_url'];
                expectedProperties.forEach(property => expect(user).toHaveProperty(property));
                });
            });
        });
        test('responds with status code 404 and error message Not Found when passed an invalid path', () => {
            return request(app)
                .get('/api/losers')
                .expect(404)
                .then(response => {
                    expect(response.body.msg).toBe('Not Found');
                });
        });
    });
});

describe('POST', () => { 
    describe('/api/articles/:article_id/comments', () => {
        test('responds with status 201 and a new comment to the relative article', () => {
            const newComment = {
                username: "butter_bridge",
                body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
            }
            return request(app)
            .post('/api/articles/4/comments')
            .send(newComment)
            .expect(201)
            .then((response) => {
                const comment = response.body.comment;

                expect(comment).toEqual({
                    article_id: 4,
                    body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                    comment_id: 19,
                    created_at: expect.any(String),
                    author: 'butter_bridge',
                    votes: expect.any(Number)
                });
            });
        });
        test('responds with status 201 and a new comment which ignores unnecessary properties', () => {
            const newComment = {
                username: "butter_bridge",
                body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                accent: "Scouse"
            }
            return request(app)
            .post('/api/articles/4/comments')
            .send(newComment)
            .expect(201)
            .then((response) => {
                const comment = response.body.comment;

                expect(comment).toEqual({
                    article_id: 4,
                    body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                    comment_id: 19,
                    created_at: expect.any(String),
                    author: 'butter_bridge',
                    votes: expect.any(Number)
                });
            });
        });
        test('responds with status 404 and an error message when passed an invalid username', () => {
            return request(app)
            .post('/api/articles/4/comments')
            .send({
                username: 'regina_george',
                body: 'Because that vest was disgusting!'
            })
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Username Does Not Exist')
            });
        });
        test('responds with status 404 and an error message when passed a non-existent article id', () => {
            return request(app)
            .post('/api/articles/999/comments')
            .send({
                username: 'butter-bridge',
                body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
            })
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Not Found')
            });
        });
        test('responds with status 400 and an error message when passed username or body input is absent', () => {
            return request(app)
            .post('/api/articles/4/comments')
            .send({ body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!" })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Bad Request')
            });
        });
        test('responds with status 400 and an error message when passed an invalid article id', () => {
            return request(app)
            .post('/api/articles/fourteen/comments')
            .send({ 
                username: 'butter_bridge',
                body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!" 
            })
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe('Bad Request')
            });
        });

    });
});

describe('PATCH', () => {
    describe('/api/articles/:article_id', () => {
        test('responds with status 200 and an updated article', () => {
            return request(app)
            .patch('/api/articles/1')
            .send({ alt_votes: 97 })
            .expect(200)
            .then(({ body: { article } }) => {
                expect(article).toEqual({ 
                    
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: '2020-07-09T20:11:00.000Z',
                    votes: 197,
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                    });
            });
        });
        test('responds with status 404 and error message if passed article does not exist', () => {
            return request(app)
                .patch('/api/articles/360')
                .send({ alt_votes: 5 })
                .expect(404)
                .then(({ body: { message } }) => {
                    expect(message).toBe('Not Found')
                });
        });
        test('responds with status 400 and error message if passed an invalid article id', () => {
            return request(app)
                .patch('/api/articles/three-six-five')
                .send({ alt_votes: 5 })
                .expect(400)
                .then(({ body: { message } }) => {
                    expect(message).toBe('Bad Request')
                });
        });
        test('responds with status 400 and error message if votes is absent', () => {
            return request(app)
                .patch('/api/articles/1')
                .send({})
                .expect(400)
                .then(({ body: { message } }) => {
                    expect(message).toBe('Bad Request')
                });
        });
        test('responds with status 400 and error message if votes is invalid', () => {
            return request(app)
                .patch('/api/articles/1')
                .send({ alt_votes: 'three-six-five'})
                .expect(400)
                .then(({ body: { message } }) => {
                    expect(message).toBe('Bad Request')
                });
        });
    });
});

describe('DELETE', () => {
    describe('/api/comments/:comment_id', () => {
        test('responds with status 204 when passed a valid comment id', () => {
            return request(app)
            .delete('/api/comments/2')
            .expect(204);
        });
        test('responds with status 404 and error message when passed a comment id that does not exist', () => {
            return request(app)
            .delete('/api/comments/222')
            .expect(404)
            // .then(({ body: { message } }) => {
            //     expect(message).toBe('Not Found')
            // });
        });
        test('responds with status 400 when passed an invalid comment id', () => {
            return request(app)
            .delete('/api/comments/kefir')
            .expect(400)
            // .then(({ body: { message } }) => {
            //     expect(message).toBe('Bad Request')
            // });
        });
    });
});
