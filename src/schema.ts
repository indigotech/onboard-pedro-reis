export const typeDefs = `
type Query {
  info: String!
  user(id: ID!): User!
  users(quantity: Int, skip: Int): UserPagination!
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

type UserPagination {
  users: [User!]!
  before: Boolean!
  after: Boolean!
}

type Login {
  user: User!
  token: String!
}
`
