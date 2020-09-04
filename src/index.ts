import { GraphQLServer } from 'graphql-yoga';
import "reflect-metadata";
import {createConnection, getConnection} from "typeorm";
import {User} from "./entity/User";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken"

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
}).then(connection => {
  console.log("Database connected");
}).catch(error => console.log(error));

const typeDefs = `
type Query {
  info: String!
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
  },

  Mutation: {
    login: async (parent, args) => {

      const cipher = crypto.createCipher('aes128', 'a passoword');
      var encryptedPassword = cipher.update(args.password, 'utf8', 'hex');
      encryptedPassword += cipher.final('hex');

      let userRepository = getConnection().getRepository(User);
      let user = await userRepository.findOne({ email: args.email });

      if (user && user.password == encryptedPassword) {
        const token = jwt.sign({username: user.name}, 'supersecret', {expiresIn: 120});
        console.log(token);
        return {
          user,
          token,
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
