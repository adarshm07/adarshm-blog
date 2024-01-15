import { gql } from 'graphql-tag';

export const typeDef = gql`
    type User {
        _id: ID
        name: String!
        email: String!
        password: String
        createdAt: String!
        updatedAt: String
        role: String!
        isActive: Boolean!
    }
    
    type UserResponse {
        _id: ID
        name: String
        email: String
        createdAt: String
        updatedAt: String
        role: String
        isActive: Boolean
    }
`