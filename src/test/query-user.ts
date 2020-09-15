import * as request from 'supertest';
import { expect } from "chai";
import { User } from '../entity/User';
import { getRepository, Repository } from 'typeorm';
import { hashEncrypt } from '../functions'
import * as jwt from 'jsonwebtoken';

import { url } from './test'

describe('Query: user', function() {
  let user: User;
  let userRepository: Repository<User>;
  let token: string;

  before(async function() {
    token = jwt.sign({id: 1234}, process.env.TOKEN_SECRET, {expiresIn: '60s'});
    user = new User()
    userRepository = getRepository(User);

    user.name = 'Joao da Silva';
    user.email = 'joao.silva@gmail.com';
    user.birthDate = '28-08-1987';
    user.cpf = 'XXXXXXXXXXX';
    user.password = hashEncrypt('joaosilvap1');

    user = await userRepository.save(user);
  })

  after (async function() {
    const userRepository = getRepository(User);
    await userRepository.clear();
  })

  it('should find an user', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: userQueryString(user.id)
      })
      expect(res.body.data.user.name).to.be.eq(user.name);
      expect(res.body.data.user.email).to.be.eq(user.email);
      expect(res.body.data.user.birthDate).to.be.eq(user.birthDate);
      expect(res.body.data.user.cpf).to.be.eq(user.cpf);
  })

  it('should not find an user', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: userQueryString(-2)
      })
      expect(res.body.errors[0].message).to.be.eq('Usuário não encontrado!');
      expect(res.body.errors[0].code).to.be.eq(404);
  })

  it('should return an error (token not valid)', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', 'anything')
      .send({
        query: userQueryString(3)
      })
      expect(res.body.errors[0].message).to.be.eq('Usuário não autenticado! Faça seu login!');
      expect(res.body.errors[0].code).to.be.eq(401);
  })
})

function userQueryString(id: number): string {
  const query: string = `
  query {
    user (
      id: ${id}
    )
    {
      id
      name
      email
      birthDate
      cpf
    }
  }`
  return query;
}
