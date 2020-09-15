import * as request from 'supertest';
import { expect } from "chai";
import { User } from '../entity/User';
import { getRepository, Repository } from 'typeorm';
import { hashEncrypt } from '../functions'
import * as jwt from 'jsonwebtoken';

import { url } from './test'

describe('Mutation: createUser', function() {
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

    await userRepository.save(user);
  })

  after (async function() {
    const userRepository = getRepository(User);
    await userRepository.clear();
  })

  it('should create an new user', async function() {

    const name = 'Maria Aparecida';
    const email = 'maria.aparecida@gmail.com';
    const birthDate = '06-10-1965';
    const cpf = 'YYYYYYYYYYY';
    const password = 'mariaaparecida1';

    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: createUserMutationString(name, email, birthDate, cpf, password)
      })
    expect(res.body.data.createUser.name).to.be.eq(name);
    expect(res.body.data.createUser.email).to.be.eq(email);
    expect(res.body.data.createUser.birthDate).to.be.eq(birthDate);
    expect(res.body.data.createUser.cpf).to.be.eq(cpf);
  })

  it('should return that there is already an user', async function() {
    const name = 'Maria Aparecida';
    const email = 'maria.aparecida@gmail.com';
    const birthDate = '06-10-1965';
    const cpf = 'YYYYYYYYYYY';
    const password = 'mariaaparecida1';

    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: createUserMutationString(name, email, birthDate, cpf, password)
      })
    expect(res.body.errors[0].message).to.be.eq('Usuário já está cadastrado!');
    expect(res.body.errors[0].code).to.be.eq(409);
  })

  it('1 - should return that the password is weak', async function() {
    const name = 'Eduardo Pereira';
    const email = 'eduardo.pereira@gmail.com';
    const birthDate = '06-10-1965';
    const cpf = 'YYYYYYYYYYY';
    const password = 'edperp';

    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: createUserMutationString(name, email, birthDate, cpf, password)
      })
    expect(res.body.errors[0].message).to.be.eq('Senha fraca!');
    expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('2 - should return that the password is weak', async function() {
    const name = 'Eduardo Pereira';
    const email = 'eduardo.pereira@gmail.com';
    const birthDate = '06-10-1965';
    const cpf = 'YYYYYYYYYYY';
    const password = 'eduardopereira';

    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: createUserMutationString(name, email, birthDate, cpf, password)
      })
    expect(res.body.errors[0].message).to.be.eq('Senha fraca!');
    expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('3 - should return that the password is weak', async function() {
    const name = 'Eduardo Pereira';
    const email = 'eduardo.pereira@gmail.com';
    const birthDate = '06-10-1965';
    const cpf = 'YYYYYYYYYYY';
    const password = '06101965';

    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query: createUserMutationString(name, email, birthDate, cpf, password)
      })
    expect(res.body.errors[0].message).to.be.eq('Senha fraca!');
    expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('should return an error (token not valid)', async function() {
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', 'anything')
      .send({
        query: createUserMutationString('a', 'a', 'a', 'a', 'a')
      })
      expect(res.body.errors[0].message).to.be.eq('Usuário não autenticado! Faça seu login!');
      expect(res.body.errors[0].code).to.be.eq(401);
  })
})

function createUserMutationString(name: string, email: string, birthDate: string, cpf: string, password: string): string {
  const mutation: string = `
  mutation {
    createUser (
      user: {
        name: "${name}",
        email: "${email}",
        birthDate: "${birthDate}",
        cpf: "${cpf}",
        password: "${password}"
      }
    )
    {
      id
      name
      email
      birthDate
      cpf
    }
  }`
  return mutation;
}
