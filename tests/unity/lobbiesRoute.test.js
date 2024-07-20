import request from 'supertest';
import { jest } from '@jest/globals';


const collection = jest.fn();
jest.unstable_mockModule('../../src/helpers/mongoConnectionWraper.js', () => ({
    default: jest.fn((c, w) => async (rq, rs) => await w(rq, rs, collection())),
}));


const app = (await import('../../src/app.js')).default;


describe('Test /lobbies end points.', () => {
    it("Should response the GET method", () => {
        collection.mockReturnValueOnce({
            find: () => ({ toArray: () => [{}, {}] })
        })
        return request(app).get("/lobbies")
            .expect(200, [{}, {}]);
    });
    it("Should response the GET method", () => {
        collection.mockReturnValueOnce({
            find: () => ({ toArray: () => [{}] })
        })
        return request(app).get("/lobbies")
            .expect(200, [{}]);
    });
});
