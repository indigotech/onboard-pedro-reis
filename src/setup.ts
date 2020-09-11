import { GraphQLServer } from 'graphql-yoga';
import { createConnection } from 'typeorm';
import { User } from './entity/User';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import * as dotenv from 'dotenv';
import { formatError } from './errors';

export async function setup() {
  const isTest: boolean = process.env.TEST == 'true';
  dotenv.config({path: process.cwd() + (isTest ? '/.env.test': '/.env') });

  await connectToDatabase();
  await startServer();
}

async function connectToDatabase() {
  await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      User
    ],
    synchronize: true,
    logging: false
  });
}

async function startServer() {
  const server = new GraphQLServer({
    typeDefs,
    resolvers,
  });

  await server.start({ formatError, debug: false, port: process.env.PORT });
}
