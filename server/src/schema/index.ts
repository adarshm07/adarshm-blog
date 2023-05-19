import { typeDef as User } from "./user.js";
import { typeDef as Post } from "./post.js";

const Query = `
      type Query {
        getUser(id: ID, email: String): User
        me(email: String): User
        getAllUsers: [User]
        getPost(id: ID, slug:String): Post
        getAllPosts: [Post]
        
      }
`

const Mutation = `
      type Mutation {
        createUser(name: String!, email: String!,  password: String!, role: String): User
        deleteUser(id: ID, email: String): User
        createPost(title: String!, content: String!, author: ID!): Post
        deletePost(id: ID, slug:String): Post
      }
`
const typeDefs = [Query, Mutation, User, Post]
export default typeDefs