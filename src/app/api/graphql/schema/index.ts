import { typeDef as User } from "./User";
import { typeDef as Post } from "./Post";
import { typeDef as Category } from "./Category";

const Query = `
      type Query {
        getUser(id: ID, email: String): UserResponse
        me(email: String): UserResponse
        getAllUsers: [UserResponse]
        getPost(id: ID, slug:String): Post
        getAllPosts: [Post]
      }
`

const Mutation = `
      type Mutation { 
        createUser(name: String!, email: String!,  password: String!, role: String): UserResponse
        deleteUser(id: ID, email: String): UserResponse
        createPost(title: String!, content: String!, author: ID, slug: String!): Post
        deletePost(id: ID, slug:String): Post
      }
`
const typeDefs = [Query, Mutation, User, Post]
export default typeDefs