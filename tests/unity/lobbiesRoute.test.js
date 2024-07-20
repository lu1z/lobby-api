import request from 'supertest';
import app from '../../src/app';


describe('Test /lobbies end points.', () => {
    it("Should response the GET method", () => {
        return request(app)
            .get("/lobbies")
            .expect(200);
    });
});

// import { describe, expect, it, jest } from '@jest/globals';

// jest.unstable_mockModule('../dependency', () => ({
//   doSomething: jest.fn()
// }));

// const myModule = await import('../myModule');
// const dependency = await import('../dependency');

// describe('myModule', async () => {
//   it('calls the dependency with double the input', () => {
//     myModule(2);
//     expect(dependency.doSomething).toBeCalledWith(4);
//   });
// });