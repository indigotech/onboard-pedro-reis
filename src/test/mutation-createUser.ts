import * as request from 'supertest';
import { expect } from "chai";
import { User } from '../entity/User';
import { getRepository, Repository } from 'typeorm';
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
  })

  afterEach (async function() {
    await userRepository.clear();
  })

  it('should create an new user', async function() {
    const userToQuery = new User();
    userToQuery.name = 'Maria Aparecida';
    userToQuery.email = 'maria.aparecida@gmail.com';
    userToQuery.birthDate = '06-10-1965';
    userToQuery.cpf = 'YYYYYYYYYYY';
    userToQuery.password = 'mariaaparecida1';

    const [query, variables] = createUserMutationString(userToQuery);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
    expect(res.body.data.createUser.id).to.be.a('string');
    expect(res.body.data.createUser.name).to.be.eq(userToQuery.name);
    expect(res.body.data.createUser.email).to.be.eq(userToQuery.email);
    expect(res.body.data.createUser.birthDate).to.be.eq(userToQuery.birthDate);
    expect(res.body.data.createUser.cpf).to.be.eq(userToQuery.cpf);

    const userFromDatabase = await userRepository.findOne({ id: res.body.data.createUser.id });
    expect(userFromDatabase).to.be.a('object');
    expect(res.body.data.createUser.name).to.be.eq(userFromDatabase.name);
    expect(res.body.data.createUser.email).to.be.eq(userFromDatabase.email);
    expect(res.body.data.createUser.birthDate).to.be.eq(userFromDatabase.birthDate);
    expect(res.body.data.createUser.cpf).to.be.eq(userFromDatabase.cpf);
  })

  it('should return that there is already an user', async function() {
    const userToQuery = new User();
    userToQuery.name = 'Maria Aparecida';
    userToQuery.email = 'maria.aparecida@gmail.com';
    userToQuery.birthDate = '06-10-1965';
    userToQuery.cpf = 'YYYYYYYYYYY';
    userToQuery.password = 'mariaaparecida1';

    userRepository.save(userToQuery);

    const [query, variables] = createUserMutationString(userToQuery);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
    expect(res.body.errors[0].message).to.be.eq('Usuário já está cadastrado!');
    expect(res.body.errors[0].code).to.be.eq(409);
  })

  it('1 - should return that the password is weak: password length less than 7', async function() {
    const userToQuery = new User();
    userToQuery.name = 'Eduardo Pereira';
    userToQuery.email = 'eduardo.pereira@gmail.com';
    userToQuery.birthDate = '06-10-1965';
    userToQuery.cpf = 'YYYYYYYYYYY';
    userToQuery.password = 'edperp';

    const [query, variables] = createUserMutationString(userToQuery);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
    expect(res.body.errors[0].message).to.be.eq('Senha fraca!');
    expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('2 - should return that the password is weak: just characters', async function() {
    const userToQuery = new User();
    userToQuery.name = 'Eduardo Pereira';
    userToQuery.email = 'eduardo.pereira@gmail.com';
    userToQuery.birthDate = '06-10-1965';
    userToQuery.cpf = 'YYYYYYYYYYY';
    userToQuery.password = 'eduardopereira';

    const [query, variables] = createUserMutationString(userToQuery);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
    expect(res.body.errors[0].message).to.be.eq('Senha fraca!');
    expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('3 - should return that the password is weak: just numbers', async function() {
    const userToQuery = new User();
    userToQuery.name = 'Eduardo Pereira';
    userToQuery.email = 'eduardo.pereira@gmail.com';
    userToQuery.birthDate = '06-10-1965';
    userToQuery.cpf = 'YYYYYYYYYYY';
    userToQuery.password = '06101965';

    const [query, variables] = createUserMutationString(userToQuery);
    const res = await request(url + ':' + process.env.PORT)
      .post('/')
      .set('authorization', token)
      .send({
        query,
        variables
      })
    expect(res.body.errors[0].message).to.be.eq('Senha fraca!');
    expect(res.body.errors[0].code).to.be.eq(400);
  })

  it('should return an error (token not valid)', async function() {
    const userToQuery = new User();
    userToQuery.name = 'Eduardo Pereira';
    userToQuery.email = 'eduardo.pereira@gmail.com';
    userToQuery.birthDate = '06-10-1965';
    userToQuery.cpf = 'YYYYYYYYYYY';
    userToQuery.password = 'eduardopereira1';

    const [query, variables] = createUserMutationString(userToQuery);
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

function createUserMutationString(user: User): [string, object] {
  const query: string = `
  mutation createUser($user: CreateUserInput!)
  {
    createUser(user: $user)
    {
      id
      name
      email
      birthDate
      cpf
    }
  }`

  const variables = { user: {
    name: user.name,
    email: user.email,
    birthDate: user.birthDate,
    cpf: user.cpf,
    password: user.password
  }}
  return [query, variables];
}
