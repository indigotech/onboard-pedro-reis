// Imports
  // GraphQL
import { GraphQLServer } from 'graphql-yoga';

  // TypeORM (banco de dados)
import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";

  // Crypto
import * as crypto from "crypto";

let users;

// Conexao com o banco de dados
createConnection({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "localdb_user",
  password: "localdb_password",
  database: "localdb_name",
  entities: [
    User
  ],
  synchronize: true,
  logging: false
}).then(async connection => {
  // here you can start to work with your entities
  console.log("Database connected");

  // Acessando o repositorio de usuarios
  let userRepository = connection.getRepository(User);

  users = await userRepository.find();

}).catch(error => console.log(error));

const typeDefs = `
type Query {
  info: String!
  feed: [User!]!
}

type Mutation {
  login(email: String!, password: String!): Login!
}

type User {
  id: ID!
  name: String!
  email: String!
  birthDate: String!
  cpf: String!
  password: String!
}

type Login {
  user: User!
  token: String!
}
`

const resolvers = {
  Query: {
    info: () => 'GraphQL Server',
    feed: () => users[0],
  },

  Mutation: {
    login: (parent, args) => {

      const cipher = crypto.createCipher('aes128', 'a passoword');
      var encrypted = cipher.update(args.password, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      for (let i = 0; i < users.length; i++) {
        if (args.email == users[i].email && encrypted == users[i].password) {
          return {
            user: users[i],
            token: "the_token",
          }
        }
      }
      // O que fazer quando nao acha nenhum user?
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(() => console.log('Server is running on http://localhost:4000'))
