import { setup } from '../setup';
import * as request from 'supertest';
import { expect } from "chai";
import { User } from '../entity/User';
import { getRepository } from 'typeorm';
import { hashEncrypt } from '../functions/functions'

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

describe('Mutation login Test', function() {
  const user = new User();
  const defaultPassword = 'joaosilvap1';;

  before(async function() {
    const userRepository = getRepository(User);

    user.name = 'Joao da Silva';
    user.email = 'joao.silva@gmail.com';
    user.birthDate = '28-08-1987';
    user.cpf = 'XXXXXXXXXXX';
    user.password = hashEncrypt(defaultPassword);

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
    expect(res.body.errors[0].code).to.be.eq(401);
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
      query: loginMutationString(user.email, 'senhaInvalida')
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

// describe('Mutation createUser Test', function() {
//   const user = new User();
//   const defaultPassword = 'joaosilvap1';;

//   before(async function() {
//     const userRepository = getRepository(User);

//     user.name = 'Joao da Silva';
//     user.email = 'joao.silva@gmail.com';
//     user.birthDate = '28-08-1987';
//     user.cpf = 'XXXXXXXXXXX';
//     user.password = hashEncrypt(defaultPassword);

//     await userRepository.save(user);
//   })

//   after (async function() {
//     const userRepository = getRepository(User);
//     await userRepository.clear();
//   })

//   it('should create an new user', async function() {
//     const res = await request(url + ':' + process.env.PORT)
//     .post('/')
//     .send({
//       query: loginMutationString('jose.silva@gmail.com', defaultPassword)
//     })
//     expect(res.body.errors[0].message).to.be.eq('Usuário não encontrado!');
//     expect(res.body.errors[0].code).to.be.eq(401);
//   })
// })

// function createUserMutationString(name: string, email: string, birthDate: string, cpf: string, password: string): string {
//   const mutation: string = `
//   mutation {
//     createUser (
//       user: {
//         name: "${name}",
//         email: "${email}",
//         birthDate: "${birthDate}",
//         cpf: "${cpf}",
//         password: "${password}"
//       }
//     )
//     {
//       id
//       name
//       email
//       birthDate
//       cpf
//       password
//     }
//   }`
//   return mutation;
// }
