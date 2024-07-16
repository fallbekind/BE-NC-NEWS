const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');

const { topicData, articleData, commentData, 
    userData } = require('../db/data/test-data');
const endPoints = require('../endpoints');

afterAll(() => db.end());
beforeEach(() => 
    seed({ topicData, articleData, commentData, userData }));

describe('GET /api/topics', () => {
    test('responds with status code 200 and array of topic objects', () => {
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
    test('responds with status code 404 and error message when passed invalid URL', () => {
        return request(app)
            .get('/api/tonics')
            .expect(404)
            .then(response => {
                expect(response.body.msg).toBe('Not Found');
            });
    });
});

describe('GET /api', () => {
    test('responds with status 200 and endpoints contents', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(({ body }) => {
                expect(body.endpoints).toEqual(endPoints)
            });
    });
});