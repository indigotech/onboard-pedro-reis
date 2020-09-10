import * as assert from "assert";
import { setup } from '../setup';
import * as request from 'supertest';
import { expect } from "chai";
import { User } from "../entity/User";
import { getConnection } from "typeorm";
import * as crypto from "crypto";

const url: string = 'http://localhost';

describe('Loading server and Database', function () {
  before(async function() {
    await setup();
  })

  describe('Tests 1', function() {
    before(async function() {
      let user = new User();
      user.name = 'Joao da Silva';
      user.email = 'joao.silva@gmail.com';
      user.birthDate = '28-08-1987';
      user.cpf = 'XXXXXXXXXXX';
      user.password = 'joaosilvap';

      const cipher = crypto.createCipher('aes128', 'a passoword');
      user.password = cipher.update(user.password, 'utf8', 'hex');
      user.password += cipher.final('hex');

      let userRepository = getConnection().getRepository(User);
      console.log('User saved');
      await userRepository.save(user);
    })

    after (async function() {
      let userRepository = getConnection().getRepository(User);
      await userRepository.clear();
      console.log('All users removed');
    })
    it('Hello Test', async function() {
      const res = await request(url + ':' + process.env.PORT)
        .post('/')
        .set('Accept', 'application/json')
        .send({
          query: 'query { info }'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        expect(res.body.data.info).to.be.eq('Hello, Taqtiler!');
    })

    it('should find a User', async function() {
      const res = await request(url + ':' + process.env.PORT)
        .post('/')
        .send({
          query: 'mutation { login( email: "joao.silva@gmail.com" password: "joaosilvap" rememberMe: true ) { user { id name email birthDate cpf } token } }'
        })
      expect(res.body.data.login.user.name).to.be.eq('Joao da Silva');
      expect(res.body.data.login.user.birthDate).to.be.eq('28-08-1987');
    })
  })
})
