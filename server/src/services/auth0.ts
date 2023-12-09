const passport = require('passport')
const Auth0Strategy = require('passport-auth0')

export const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://localhost:4000',
    clientID: 'tRgpvc0RsMUfJw9hcvw051hi7HHqnGzq',
    issuerBaseURL: 'https://dev-hh68fy1m.us.auth0.com'
  };

var auth0Strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL,
        passReqToCallback: true
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