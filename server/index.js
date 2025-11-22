import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import net from 'net'
import { initDatabase } from './database/init.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import customersRouter from './routes/customers.js'
import returnsRouter from './routes/returns.js'
import authRouter from './routes/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/customers', customersRouter)
app.use('/api/returns', returnsRouter)
app.use('/api/auth', authRouter)

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Check if port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.once('close', () => resolve(true))
      server.close()
    })
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false)
      } else {
        resolve(false)
      }
    })
  })
}

// Find available port
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(startPort, () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port
        findAvailablePort(startPort + 1).then(resolve).catch(reject)
      } else {
        reject(err)
      }
    })
  })
}

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Initializing database...')
    await initDatabase()
    console.log('✅ Database initialized successfully')
    
    // Check if port is available
    const isPortAvailable = await checkPort(PORT).catch(() => false)
    let actualPort = PORT
    
    if (!isPortAvailable) {
      console.log(`⚠️  Port ${PORT} is already in use`)
      console.log(`🔍 Finding available port...`)
      actualPort = await findAvailablePort(PORT + 1)
      console.log(`✅ Using port ${actualPort} instead`)
    }
    
    const server = app.listen(actualPort, () => {
      console.log(`\n✨ Server is running on port ${actualPort}`)
      console.log(`📡 API available at http://localhost:${actualPort}/api`)
      if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Frontend served at http://localhost:${actualPort}`)
      } else {
        console.log(`🌐 Frontend dev server: http://localhost:5173`)
      }
      console.log(`\n💡 Health check: http://localhost:${actualPort}/health\n`)
    })
    
    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${actualPort} is already in use`)
        console.error(`💡 Solutions:`)
        console.error(`   1. Kill the process using port ${actualPort}:`)
        console.error(`      Linux/Mac: lsof -ti:${actualPort} | xargs kill -9`)
        console.error(`      Windows: netstat -ano | findstr :${actualPort}`)
        console.error(`   2. Use a different port: PORT=3001 npm run server`)
        console.error(`   3. Check if PM2 is running: pm2 list`)
        process.exit(1)
      } else {
        console.error('❌ Server error:', err)
        process.exit(1)
      }
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    if (error.code === 'EADDRINUSE') {
      console.error(`\n💡 Port ${PORT} is already in use. Solutions:`)
      console.error(`   1. Kill process: lsof -ti:${PORT} | xargs kill -9`)
      console.error(`   2. Use different port: PORT=3001 npm run server`)
      console.error(`   3. Check PM2: pm2 list`)
    }
    process.exit(1)
  }
}

startServer()

export default app

