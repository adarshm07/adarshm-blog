import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import typeDefs from './schema';
import resolvers from './resolvers';
import connect from './services/db';

import passport from 'passport';
import Auth0Strategy from 'passport-auth0';
import { auth } from 'express-openid-connect';

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

app.use('/graphql', cors<cors.CorsRequest>(),
    bodyParser.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
    }),
);

var auth0Strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL,
        passReqToCallback: true,
        state: true
    },
    function (req: any, accessToken: any, refreshToken: any, extraParams: any, profile: any, done: (arg0: any, arg1: any) => any) {
        console.log(req, accessToken, refreshToken, extraParams, profile, done);

        //
        // State value is in req.query.state ...
        //
        return done(null, profile);
    }
);
passport.use(auth0Strategy);


const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a1780107716dea5b7a1ecb0d8ea89abd746ab9ea62da38591e9835b50afd1a33',
    baseURL: 'http://localhost:4000',
    clientID: 'tRgpvc0RsMUfJw9hcvw051hi7HHqnGzq',
    issuerBaseURL: 'https://dev-hh68fy1m.us.auth0.com'
};

app.use(auth(config));

app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get(
    '/login',
    passport.authenticate('auth0', { scope: 'openid email profile' }),
    function (req, res) {
        res.redirect('/');
    }
);

// Modified server startup
const PORT = { port: process.env.PORT || 4000 }
await new Promise<void>((resolve) => {
    httpServer.listen(PORT, resolve);
    // connect with mongodb
    connect();
});
console.log(`🚀 Server ready at http://localhost:${PORT.port}/graphql`);