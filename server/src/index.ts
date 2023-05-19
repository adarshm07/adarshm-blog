import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import typeDefs from './schema/index.js';
import resolvers from './resolvers/index.js';
import connect from './services/db.js';

dotenv.config();

const app = express();

interface MyContext {
    token?: string;
}

const httpServer = http.createServer(app);

const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

app.use('/', cors<cors.CorsRequest>(),
    bodyParser.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
    }),
);

// Modified server startup
const PORT = { port: process.env.PORT || 4000 }
await new Promise<void>((resolve) => {
    httpServer.listen(PORT, resolve);
    // connect with mongodb
    connect();
});
console.log(`🚀 Server ready at http://localhost:${PORT.port}/graphql`);