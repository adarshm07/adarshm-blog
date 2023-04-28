import { typeDef as User } from "./user.js";
import { typeDef as Post } from "./post.js";

const Query = `
      type Query {
        user(id: ID, email: String): User
        post(id: ID): Post
      }
`
const typeDefs = [Query, User, Post]
export default typeDefs