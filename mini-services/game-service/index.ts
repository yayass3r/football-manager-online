import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

interface OnlineManager {
  id: string
  username: string
  teamName: string
}

const onlineManagers = new Map<string, OnlineManager>()

// Live match state
interface LiveMatchState {
  homeTeam: string
  awayTeam: string
  homeGoals: number
  awayGoals: number
  minute: number
  events: Array<{
    minute: number
    type: string
    team: string
    description: string
  }>
}

const activeMatches = new Map<string, LiveMatchState>()

io.on('connection', (socket) => {
  console.log(`Manager connected: ${socket.id}`)

  socket.on('join-game', (data: { username: string; teamName: string }) => {
    const manager: OnlineManager = {
      id: socket.id,
      username: data.username,
      teamName: data.teamName,
    }
    onlineManagers.set(socket.id, manager)
    
    // Notify others
    io.emit('manager-online', { 
      manager: { username: data.username, teamName: data.teamName },
      onlineCount: onlineManagers.size 
    })
    
    // Send online list to new manager
    const managers = Array.from(onlineManagers.values())
    socket.emit('online-managers', { managers })
    
    console.log(`${data.username} (${data.teamName}) joined. Online: ${onlineManagers.size}`)
  })

  // Chat message
  socket.on('chat-message', (data: { username: string; message: string; teamName: string }) => {
    io.emit('chat-message', {
      id: Math.random().toString(36).substr(2, 9),
      username: data.username,
      teamName: data.teamName,
      message: data.message,
      timestamp: new Date().toISOString(),
    })
  })

  // Match events - broadcast live match updates
  socket.on('match-event', (data: { 
    teamName: string; 
    event: string; 
    description: string;
    minute: number;
  }) => {
    io.emit('match-update', {
      teamName: data.teamName,
      event: data.event,
      description: data.description,
      minute: data.minute,
      timestamp: new Date().toISOString(),
    })
  })

  // Transfer market activity
  socket.on('transfer-activity', (data: {
    type: 'buy' | 'sell';
    playerName: string;
    teamName: string;
    price: number;
  }) => {
    io.emit('transfer-update', {
      type: data.type,
      playerName: data.playerName,
      teamName: data.teamName,
      price: data.price,
      timestamp: new Date().toISOString(),
    })
  })

  // League updates
  socket.on('league-update', (data: {
    matchDay: number;
    results: Array<{ homeTeam: string; awayTeam: string; homeGoals: number; awayGoals: number }>;
  }) => {
    io.emit('league-results', {
      matchDay: data.matchDay,
      results: data.results,
      timestamp: new Date().toISOString(),
    })
  })

  socket.on('disconnect', () => {
    const manager = onlineManagers.get(socket.id)
    if (manager) {
      onlineManagers.delete(socket.id)
      io.emit('manager-offline', { 
        manager: { username: manager.username, teamName: manager.teamName },
        onlineCount: onlineManagers.size 
      })
      console.log(`${manager.username} disconnected. Online: ${onlineManagers.size}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Game WebSocket service running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('Shutting down game service...')
  httpServer.close(() => {
    console.log('Game service closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Shutting down game service...')
  httpServer.close(() => {
    console.log('Game service closed')
    process.exit(0)
  })
})
