import * as assert from "assert";
import { setup } from '../setup';
import * as request from 'supertest';
import { expect } from "chai";

describe('Tests', function () {
  before(async function() {
    await setup();
  })

  it('should print GraphQL Server', async function() {
    const res = await request("http://localhost:4001")
    .post('/')
    .set('Accept', 'application/json')
    .send({
      query: 'query { info }'
    })
    .expect(200)
    .expect('Content-Type', /json/)
    expect(res.body.data.info).to.be.eq('Hello, Taqtiler!');
  })
})
