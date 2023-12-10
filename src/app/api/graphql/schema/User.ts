import { gql } from 'graphql-tag';

export const typeDef = gql`
    type User {
        name: String!
        email: String!
        password: String
        createdAt: String!
        updatedAt: String
        role: String!
        isActive: Boolean
    }
    
    type UserResponse {
        name: String!
        email: String!
        createdAt: String!
        updatedAt: String
        role: String!
        isActive: Boolean
    }
`