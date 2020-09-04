// Imports
  // GraphQL
import { GraphQLServer } from 'graphql-yoga';

  // TypeORM (banco de dados)
import "reflect-metadata";
import {createConnection, getConnection} from "typeorm";
import {User} from "./entity/User";

  // Crypto
import * as crypto from "crypto";

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

      // Encriptando a senha passada como parametro
      const cipher = crypto.createCipher('aes128', 'a passoword');
      var encryptedPassword = cipher.update(args.password, 'utf8', 'hex');
      encryptedPassword += cipher.final('hex');

      // Acessando o repositorio de usuarios
      let userRepository = getConnection().getRepository(User);

      // Verificando se ha um usuario cujo email eh o email do parametro
      let userRequired = await userRepository.findOne({ email: args.email });

      // Se sim, verifique se sua senha esta correta
      if (userRequired.password == encryptedPassword) {
        // Se estiver, retorna esse usuario com seu token
        return {
          user: userRequired,
          token: "the_token",
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
