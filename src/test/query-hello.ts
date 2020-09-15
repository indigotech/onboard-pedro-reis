import * as request from 'supertest';
import { expect } from "chai";

import { url } from './test'

describe('Query: hello', function() {
  it('should find a "Hello, Taqtiler!"', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .send({
        query: helloQueryString()
      })
    expect(res.body.data.hello).to.be.eq('Hello, Taqtiler!');
  })
})

function helloQueryString(): string {
  const query: string = `
  query {
    hello
  }`
  return query;
}
