export const typeDefs = `
type Query {
  info: String!
}

type Mutation {
  login(email: String!, password: String!, rememberMe: Boolean): Login!
  createUser(user: CreateUserInput!): User!
}

input CreateUserInput {
  name: String!
  email: String!
  birthDate: String!
  cpf: String!
  password: String!
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
