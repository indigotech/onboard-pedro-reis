import * as request from 'supertest';
import { expect } from "chai";
import { User } from '../entity/User';
import { getRepository, Repository } from 'typeorm';
import { hashEncrypt } from '../functions'

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
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .send({
        query: loginMutationString(user.email, defaultPassword)
      })
    expect(res.body.data.login.user.name).to.be.eq(user.name);
    expect(res.body.data.login.user.email).to.be.eq(user.email);
    expect(res.body.data.login.user.birthDate).to.be.eq(user.birthDate);
    expect(res.body.data.login.user.cpf).to.be.eq(user.cpf);
  })

  it('should return wrong email format error', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .send({
        query: loginMutationString('joao.silvagmail.com', defaultPassword)
      })
    expect(res.body.errors[0].message).to.be.eq('Formato de e-mail incorreto!');
    expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('should return no user found', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .send({
        query: loginMutationString('jose.silva@gmail.com', defaultPassword)
      })
    expect(res.body.errors[0].message).to.be.eq('Usuário não encontrado!');
    expect(res.body.errors[0].code).to.be.eq(401);
  })

  it('should return wrong password', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .send({
        query: loginMutationString(user.email, 'senhaInvalida1')
      })
    expect(res.body.errors[0].message).to.be.eq('Email e/ou senha incorretos!');
    expect(res.body.errors[0].code).to.be.eq(401);
  })
})

function loginMutationString(email: string, password: string): string {
  const mutation: string = `
  mutation {
    login(
      email: "${email}"
      password: "${password}"
      rememberMe: true
    ) {
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
  return mutation;
}
