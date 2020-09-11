import { setup } from '../setup';
import * as request from 'supertest';
import { expect } from "chai";
import { User } from '../entity/User';
import { getRepository } from 'typeorm';
import { hashEncrypt, hashDecrypt } from '../functions/functions'

const url: string = 'http://localhost';

before(async function() {
  await setup();
})

describe('Hello', function() {
  it('should find a "Hello, Taqtiler!"', async function() {
    const res = await request(url + ':' + process.env.PORT)
    .post('/')
    .send({
      query: 'query { info }'
    })
    expect(res.body.data.info).to.be.eq('Hello, Taqtiler!');
  })
})

describe('Mutation Login Test', function() {
  before(async function() {
    const userRepository = getRepository(User);

    const user = new User();
    user.name = 'Joao da Silva';
    user.email = 'joao.silva@gmail.com';
    user.birthDate = '28-08-1987';
    user.cpf = 'XXXXXXXXXXX';
    user.password = hashEncrypt('joaosilvap');

    await userRepository.save(user);
  })

  after (async function() {
    const userRepository = getRepository(User);
    await userRepository.clear();
  })

  it('should find a User', async function() {
    const res = await request(url + ':' + process.env.PORT)
    .post('/')
    .send({
      query: 'mutation { login( email: "joao.silva@gmail.com" password: "joaosilvap" rememberMe: true ) { user { id name email birthDate cpf password } token } }'
    })
    expect(res.body.data.login.user.name).to.be.eq('Joao da Silva');
    expect(res.body.data.login.user.email).to.be.eq('joao.silva@gmail.com');
    expect(res.body.data.login.user.birthDate).to.be.eq('28-08-1987');
    expect(res.body.data.login.user.cpf).to.be.eq('XXXXXXXXXXX');
    expect(hashDecrypt(res.body.data.login.user.password)).to.be.eq('joaosilvap');
  })

  it('should return wrong email format error', async function() {
    const res = await request(url + ':' + process.env.PORT)
    .post('/')
    .send({
      query: 'mutation { login( email: "joao.silvagmail.com" password: "joaosilvap" rememberMe: true ) { user { id name email birthDate cpf password } token } }'
    })
    expect(res.body.errors[0].message).to.be.eq('Formato de e-mail incorreto!');
    expect(res.body.errors[0].code).to.be.eq(401);
  })

  it('should return no user found', async function() {
    const res = await request(url + ':' + process.env.PORT)
    .post('/')
    .send({
      query: 'mutation { login( email: "joao.silva@gmail.co" password: "joaosilvap" rememberMe: true ) { user { id name email birthDate cpf password } token } }'
    })
    expect(res.body.errors[0].message).to.be.eq('Usuário não encontrado!');
    expect(res.body.errors[0].code).to.be.eq(401);
  })

  it('should return wrong password', async function() {
    const res = await request(url + ':' + process.env.PORT)
    .post('/')
    .send({
      query: 'mutation { login( email: "joao.silva@gmail.com" password: "joaosilva" rememberMe: true ) { user { id name email birthDate cpf password } token } }'
    })
    expect(res.body.errors[0].message).to.be.eq('Senha incorreta!');
    expect(res.body.errors[0].code).to.be.eq(401);
  })
})
