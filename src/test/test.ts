import { setup } from '../setup';
import * as request from 'supertest';
import { expect } from "chai";
import { User } from '../entity/User';
import { getRepository, Repository } from 'typeorm';
import { hashEncrypt } from '../functions'

export const url: string = 'http://localhost';

before(async function() {
  await setup();
})

require('./query-hello');
require('./query-user');
require('./query-users');

require('./mutation-login');
require('./mutation-createUser');
