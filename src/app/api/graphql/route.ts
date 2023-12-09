import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { NextRequest } from 'next/server';
import dbConnect from '@/utils/db-connect';

const resolvers = {
    Query: {
        hello: () => 'world',
    },
};

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const server = new ApolloServer({
    resolvers,
    typeDefs,
});

(async () => {
    await dbConnect();
})();

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    context: async req => ({ req }),
});

export { handler as GET, handler as POST };