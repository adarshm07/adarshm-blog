import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from "@graphql-tools/schema"
import { applyMiddleware } from "graphql-middleware"
import dbConnect from '@/utils/db-connect';
import resolvers from './resolvers';
import typeDefs from './schema';
import express from 'express';
import { auth } from "express-openid-connect"

const app = express();

const config = {
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    secret: process.env.AUTH0_CLIENT_SECRET,
    authRequired: false,
    auth0Logout: true,
}

app.use(auth(config))

const schema: any = makeExecutableSchema({ typeDefs, resolvers })

const schemaMiddleware: any = applyMiddleware(schema)

const server = new ApolloServer({ schema: schemaMiddleware });

(async () => await dbConnect())();

const handler = startServerAndCreateNextHandler(server, {
    context: async (req: any, res: any) => {
        console.log(req.oidc.isAuthenticated());
        return req;
    },
});

export { handler as GET, handler as POST };