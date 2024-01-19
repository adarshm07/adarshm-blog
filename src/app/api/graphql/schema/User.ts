import { gql } from 'graphql-tag';

export const typeDef = gql`
    type User {
        _id: ID
        name: String!
        email: String!
        password: String
        role: String!
        isActive: Boolean!
        createdAt: String
        updatedAt: String
    }
    
    type UserResponse {
        _id: ID
        name: String
        email: String
        role: String
        isActive: Boolean
        createdAt: String
        updatedAt: String
    }
`