import { typeDef as User } from "./user.js";
import { typeDef as Post } from "./post.js";

const Query = `
      type Query {
        user(id: ID, email: String): User
        me(email: String): User
        getAllUsers: [User]
      }
`

const Mutation = `
      type Mutation {
        createUser(name: String!, email: String!,  password: String!, role: String): User
      }
`
const typeDefs = [Query, Mutation, User, Post]
export default typeDefs