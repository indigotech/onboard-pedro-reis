import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { getConnection } from "typeorm";
import { User } from "./entity/User";

export const typeDefs = `
type Query {
  info: String!
}

type Mutation {
  login(email: String!, password: String!, rememberMe: Boolean): Login!
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

export const resolvers = {
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
        const token = jwt.sign({id: user.id}, 'supersecret', {expiresIn: args.remeberMe ? "7d": "1h"});
        return {
          user,
          token,
        }
      }
      // O que fazer quando nao acha nenhum user?
    }
  }
}
