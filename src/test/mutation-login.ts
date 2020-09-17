import * as request from 'supertest';
import { expect } from "chai";
import { User } from '../entity/User';
import { getRepository, Repository } from 'typeorm';
import { hashEncrypt, verifyToken } from '../functions'

import { url } from './test'

describe('Mutation: login', function() {

  const user = new User();
  const defaultPassword = 'joaosilvap1';
  let userRepository: Repository<User>;

  before(async function() {
    userRepository = getRepository(User);
    user.name = 'Joao da Silva';
    user.email = 'joao.silva@gmail.com';
    user.birthDate = '28-08-1987';
    user.cpf = 'XXXXXXXXXXX';
    user.password = hashEncrypt(defaultPassword);

    await userRepository.save(user);
  })

  after (async function() {
    await userRepository.clear();
  })

  it('should find a User', async function() {
    const [query, variables] = loginMutationString(user.email, defaultPassword, false);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .send({
        query,
        variables
      })
    expect(res.body.data.login.user.name).to.be.eq(user.name);
    expect(res.body.data.login.user.email).to.be.eq(user.email);
    expect(res.body.data.login.user.birthDate).to.be.eq(user.birthDate);
    expect(res.body.data.login.user.cpf).to.be.eq(user.cpf);
    expect(res.body.data.login.token).to.be.a('string');
    expect(verifyToken(res.body.data.login.token)).to.have.property('id');
  })

  it('should return wrong email format error', async function() {
    const [query, variables] = loginMutationString('joao.silvagmail.com', defaultPassword, false);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .send({
        query,
        variables
      })
    expect(res.body.errors[0].message).to.be.eq('Formato de e-mail incorreto!');
    expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('should return no user found', async function() {
    const [query, variables] = loginMutationString('jose.silva@gmail.com', defaultPassword, false);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .send({
        query,
        variables
      })
    expect(res.body.errors[0].message).to.be.eq('Usuário não encontrado!');
    expect(res.body.errors[0].code).to.be.eq(401);
  })

  it('should return wrong password', async function() {
    const [query, variables] = loginMutationString(user.email, 'senhaInvalida1', false);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .send({
        query,
        variables
      })
    expect(res.body.errors[0].message).to.be.eq('Email e/ou senha incorretos!');
    expect(res.body.errors[0].code).to.be.eq(401);
  })
})

function loginMutationString(email: string, password: string, rememberMe: boolean): [string, object] {
  const query: string = `
  mutation login($email: String!, $password: String!, $rememberMe: Boolean!)
  {
    login(email: $email, password: $password, rememberMe: $rememberMe)
    {
      user
      {
        id
        name
        email
        birthDate
        cpf
      }
      token
    }
  }`

  const variables: object = { email, password, rememberMe }
  return [query, variables];
}
