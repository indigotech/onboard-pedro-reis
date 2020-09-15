import * as request from 'supertest';
import { expect } from "chai";
import { User } from '../entity/User';
import { getRepository, Repository } from 'typeorm';
import { hashEncrypt } from '../functions'
import * as faker from 'faker';
import * as jwt from 'jsonwebtoken';

import { url } from './test'

describe('Query: users', function() {
  let token: string;
  let quantityToPopulateDatabse = 20;
  let quantity = 5;
  let pageCount = quantityToPopulateDatabse/quantity;

  before(async function() {
    let userRepository = getRepository(User);
    let users = [];

    for (let i = 0; i < quantityToPopulateDatabse; i++) {
      const user = new User();
      user.name = faker.name.findName();
      user.email = faker.internet.email();
      user.birthDate = '01-01-1990';
      user.cpf = 'XXXXXXXXXXX';
      user.password = hashEncrypt('1234qwer');

      users.push(user);
    }

    await userRepository.save(users);

    token = jwt.sign({id: 1234}, process.env.TOKEN_SECRET, {expiresIn: '60s'});
  })

  after (async function() {
    const userRepository = getRepository(User);
    await userRepository.clear();
  })

  it('should find users - default input', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: usersQueryString()
      })
      expect(res.body.data.users.users.length).to.be.eq(5);
      expect(res.body.data.users.userCount).to.be.eq(quantityToPopulateDatabse);

      expect(res.body.data.users.before).to.be.eq(false);
      expect(res.body.data.users.after).to.be.eq(5 > quantityToPopulateDatabse ? false : true);
  })

  for (let i = 0; i < pageCount; i++) {
    it('page ' + (i + 1) + ' - should find users', async function() {
      const res = await request(url + ':' + process.env.PORT)
        .post('/')
        .set('authorization', token)
        .send({
          query: usersQueryString(quantity, quantity*i)
        })
        expect(res.body.data.users.users.length).to.be.eq(quantity);
        expect(res.body.data.users.userCount).to.be.eq(quantityToPopulateDatabse);

        expect(res.body.data.users.before).to.be.eq(i === 0 ? false : true);
        expect(res.body.data.users.after).to.be.eq(i === pageCount - 1 ? false : true);
    })
  }

  it('should return an error (quantity negative)', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: usersQueryString(-1, 5)
      })
      expect(res.body.errors[0].message).to.be.eq('A quantidade e o offset devem ser positivos');
      expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('should return an error (skip negative)', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: usersQueryString(5, -1)
      })
      expect(res.body.errors[0].message).to.be.eq('A quantidade e o offset devem ser positivos');
      expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('should return an error (token not valid)', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', 'anything')
      .send({
        query: usersQueryString(5, 5)
      })
      expect(res.body.errors[0].message).to.be.eq('Usuário não autenticado! Faça seu login!');
      expect(res.body.errors[0].code).to.be.eq(401);
  })
})

function usersQueryString(quantity?: number, skip?: number): string {
  let query: string = `
  query {
    users`

  if (quantity !== undefined && skip !== undefined) {
    query = query + ` (
      quantity: ${quantity},
      skip: ${skip}
    )`
  } else if (quantity !== undefined) {
    query = query + ` (
      quantity: ${quantity}
    )`
  } else if (skip !== undefined) {
    query = query + ` (
      skip: ${skip}
    )`
  } else {
    query = query + `
    `
  }

  query = query + `
    {
      users {
        id
      }
      userCount
      before
      after
    }
  }`
  return query;
}
