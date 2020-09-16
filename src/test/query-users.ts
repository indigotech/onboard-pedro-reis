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
    const [query, variables] = usersQueryString();
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
      expect(res.body.data.users.users.length).to.be.eq(5);
      expect(res.body.data.users.userCount).to.be.eq(quantityToPopulateDatabse);

      expect(res.body.data.users.before).to.be.eq(false);
      expect(res.body.data.users.after).to.be.eq(5 > quantityToPopulateDatabse ? false : true);
  })

  it('should find users - default skip', async function() {
    const quantity = 10;
    const [query, variables] = usersQueryString(quantity);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
      expect(res.body.data.users.users.length).to.be.eq(quantity);
      expect(res.body.data.users.userCount).to.be.eq(quantityToPopulateDatabse);
      expect(res.body.data.users.before).to.be.eq(false);
      expect(res.body.data.users.after).to.be.eq(true);
  })

  it('should find users - default quantity', async function() {
    const skip = 2;
    const [query, variables] = usersQueryString(undefined, skip);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
      expect(res.body.data.users.users.length).to.be.eq(5);
      expect(res.body.data.users.userCount).to.be.eq(quantityToPopulateDatabse);
      expect(res.body.data.users.before).to.be.eq(true);
      expect(res.body.data.users.after).to.be.eq(true);
  })

  it('should find users - normal entry', async function() {
    const quantity = 7;
    const skip = 2;
    const [query, variables] = usersQueryString(quantity, skip);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
      expect(res.body.data.users.users.length).to.be.eq(quantity);
      expect(res.body.data.users.userCount).to.be.eq(quantityToPopulateDatabse);
      expect(res.body.data.users.before).to.be.eq(true);
      expect(res.body.data.users.after).to.be.eq(true);
  })

  it('should find users - first users', async function() {
    const quantity = 9;
    const skip = 0;
    const [query, variables] = usersQueryString(quantity, skip);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
      expect(res.body.data.users.users.length).to.be.eq(quantity);
      expect(res.body.data.users.userCount).to.be.eq(quantityToPopulateDatabse);
      expect(res.body.data.users.before).to.be.eq(false);
      expect(res.body.data.users.after).to.be.eq(true);
  })

  it('should find users - skip all', async function() {
    const quantity = 5;
    const skip = quantityToPopulateDatabse;
    const [query, variables] = usersQueryString(quantity, skip);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
      expect(res.body.data.users.users.length).to.be.eq(0);
      expect(res.body.data.users.userCount).to.be.eq(quantityToPopulateDatabse);
      expect(res.body.data.users.before).to.be.eq(true);
      expect(res.body.data.users.after).to.be.eq(false);
  })

  it('should find users - quantity > quantityToPopulateDatabase', async function() {
    const quantity = quantityToPopulateDatabse + 5;
    const skip = 0;
    const [query, variables] = usersQueryString(quantity, skip);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
      expect(res.body.data.users.users.length).to.be.eq(quantityToPopulateDatabse);
      expect(res.body.data.users.userCount).to.be.eq(quantityToPopulateDatabse);
      expect(res.body.data.users.before).to.be.eq(false);
      expect(res.body.data.users.after).to.be.eq(false);
  })

  it('should return an error (quantity negative)', async function() {
    const [query, variables] = usersQueryString(-1, 5);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
      expect(res.body.errors[0].message).to.be.eq('A quantidade e o offset devem ser positivos');
      expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('should return an error (skip negative)', async function() {
    const [query, variables] = usersQueryString(5, -1);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
      expect(res.body.errors[0].message).to.be.eq('A quantidade e o offset devem ser positivos');
      expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('should return an error (token not valid)', async function() {
    const [query, variables] = usersQueryString(5, 5);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', 'anything')
      .send({
        query,
        variables
      })
      expect(res.body.errors[0].message).to.be.eq('Usuário não autenticado! Faça seu login!');
      expect(res.body.errors[0].code).to.be.eq(401);
  })
})

function usersQueryString(quantity?: number, skip?: number): [string, object] {
  const query: string = `
  query users($quantity: Int, $skip: Int)
  {
    users(quantity: $quantity, skip: $skip)
    {
      users {
        id
      }
      userCount
      before
      after
    }
  }`

  const variables: object = {quantity, skip};
  return [query, variables];
}
