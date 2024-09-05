import { gql } from 'graphql-tag';

export const typeDef = gql`
    type Category {
        _id: ID!
        title: String!
        content: String!
        slug: String!
        author: User!
        createdAt: String
        updatedAt: String
    }
`