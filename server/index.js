import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
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

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Initializing database...')
    await initDatabase()
    console.log('✅ Database initialized successfully')
    
    app.listen(PORT, () => {
      console.log(`\n✨ Server is running on port ${PORT}`)
      console.log(`📡 API available at http://localhost:${PORT}/api`)
      if (process.env.NODE_ENV === 'production') {
        console.log(`🌐 Frontend served at http://localhost:${PORT}`)
      } else {
        console.log(`🌐 Frontend dev server: http://localhost:5173`)
      }
      console.log(`\n💡 Health check: http://localhost:${PORT}/health\n`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app

