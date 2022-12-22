import axios from 'axios'
import Cors from 'cors'
import { apiDomain } from '../../config/mediaUrls'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
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
    const data = await axios.post(`${apiDomain}/auth/login`, req.body, { headers: { 'Access-Control-Allow-Credentials': true } })
    res.json(data.data)
  } catch (error) {
    console.log(error.message);
  }
}

export default handler