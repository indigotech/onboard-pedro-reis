// Imports
  // GraphQL (servidor)
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

// 1
const typeDefs = `
type Query {
  info: String!
}
`

// 2
const resolvers = {
  Query: {
    info: () => 'GraphQL Server'
  }
}

// 3
const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(() => console.log('Server is running on http://localhost:4000'))
