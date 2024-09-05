import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from "@graphql-tools/schema"
import { applyMiddleware } from "graphql-middleware"
import dbConnect from '@/utils/db-connect';
import resolvers from './resolvers';
import typeDefs from './schema';
const schema: any = makeExecutableSchema({ typeDefs, resolvers })

const schemaMiddleware: any = applyMiddleware(schema)

const server = new ApolloServer({ schema: schemaMiddleware });

(async () => await dbConnect())();

const handler = startServerAndCreateNextHandler(server, {
    context: async (req: any, res: any) => {
        return req;
    },
});

export { handler as GET, handler as POST };