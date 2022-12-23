import axios from 'axios'
import Cors from 'cors'
import { apiDomain } from '../../config/mediaUrls'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'POST', 'HEAD'],
  origin: '*'
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: any, res: any, fn: (arg0: any, arg1: any, arg2: (result: any) => void) => void) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

async function handler(req: any, res: { json: (arg0: { message: string }) => void }) {
  // Run the middleware
  await runMiddleware(req, res, cors)

  try {
    const config: any = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'withCredentials': true
      },
      body: JSON.stringify(req.body),
      redirect: 'follow'
    };

    // const data = await axios.post(`${apiDomain}/auth/login`, req.body, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Credentials': true,
    //     'withCredentials': true
    //   }
    // })
    const data = await fetch(`${apiDomain}/auth/login`, config)
    const json = await data.json()
    res.json(json)
  } catch (error: any) {
    console.log('error', error.message);
    res.json({ "message": error.message })
  }
}

export default handler