import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = Number(process.env.PORT || 3000)
const distDir = path.join(__dirname, 'dist')

const username = process.env.BASIC_AUTH_USERNAME
const password = process.env.BASIC_AUTH_PASSWORD
const authEnabled = Boolean(username && password)

function sendUnauthorized(res) {
  res.set('WWW-Authenticate', 'Basic realm="Protected"')
  res.status(401).send('Authentication required')
}

app.use((req, res, next) => {
  if (!authEnabled) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return sendUnauthorized(res)
  }

  const encoded = authHeader.slice('Basic '.length)
  const decoded = Buffer.from(encoded, 'base64').toString('utf8')
  const [providedUser, providedPass] = decoded.split(':')

  if (providedUser === username && providedPass === password) {
    return next()
  }

  return sendUnauthorized(res)
})

app.use(express.static(distDir))

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
