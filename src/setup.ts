import { GraphQLServer } from "graphql-yoga";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import { typeDefs, resolvers } from './index';

export async function setup() {
  await connectToDatabase();
  await startServer();
}

async function connectToDatabase() {
  await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [
      User
    ],
    synchronize: true,
    logging: false
  });
  console.log( (process.env.TEST ? "Test" : "Local") + " Database connected");
}

async function startServer() {
  const server = new GraphQLServer({
    typeDefs,
    resolvers,
  });

  await server.start({ port: process.env.PORT });
  console.log("Server is running on http://localhost:" + process.env.PORT);
}