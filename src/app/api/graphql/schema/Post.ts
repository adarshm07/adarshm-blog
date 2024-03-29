import { gql } from 'graphql-tag';

export const typeDef = gql`
    type Post {
        _id: ID
        title: String!
        content: String!
        slug: String!
        author: User
        updatedAt: String
        createdAt: String
    }
`