// Imports
  // GraphQL
import { GraphQLServer } from 'graphql-yoga';

  // TypeORM (banco de dados)
import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";

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
  // here you can start to work with your entities
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
}

type Login {
  user: User!
  token: String!
}
`

let users = [{
  id: 12,
  name: 'User aaa',
  email: 'User e-mail',
  birthDate: '04-25-1990',
  cpf: 'XXXXXXXXXXX',
}]

const resolvers = {
  Query: {
    info: () => 'GraphQL Server',
    feed: () => users,
  },

  Mutation: {
    login: (parent, args) => {
      const user: User = users[0]
      const token: string = 'the_token'
      return {
        user,
        token,
      }
      }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(() => console.log('Server is running on http://localhost:4000'))
