const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');

const topicData = require('../db/data/test-data/topics');
const articleData = require('../db/data/test-data/articles');
const commentData = require('../db/data/test-data/comments');
const userData = require('../db/data/test-data/users');

beforeEach(() => 
    seed({ topicData, articleData, commentData, userData }));
afterAll(() => db.end());

describe('GET /api/topics test', () => {
    test('responds with status code 200 and an array', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(response => {
            expect(Array.isArray(response.body.topics)).toBe(true);
        });
    });
    test('responds with an array of topic objects with keys of slug and description', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(response => {
            response.body.topics.forEach((topic) => {
            expect(topic).toHaveProperty('slug');
            expect(topic).toHaveProperty('description');
            });
        });        
    });


});