import * as faker from 'faker';
import { getRepository } from 'typeorm';
import { User } from './entity/User';
import { hashEncrypt } from './functions';
import { setup } from './setup';

populateDataBase(50);

async function populateDataBase(quantity: number) {
  await setup();
  let userRepository = getRepository(User);
  let users = [];

  for (let i = 0; i < quantity; i++) {
    const user = new User();
    user.name = faker.name.findName();
    user.email = faker.internet.email();
    user.birthDate = '01-01-1990';
    user.cpf = 'XXXXXXXXXXX';
    user.password = hashEncrypt('1234qwer');

    users.push(user);
  }
  await userRepository.save(users);
}
