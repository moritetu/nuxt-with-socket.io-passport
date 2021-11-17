import socketIO from 'socket.io'
import passport from 'passport'
import session from './session'

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

export function attachSocketIO(server) {
  const io = socketIO(server, { serveClient: false })

  // socketio
  io.use(wrap(session))
  io.use(wrap(passport.initialize()))
  io.use(wrap(passport.session()))

  io.use((socket, next) => {
    if (socket.request.user) {
      next()
    } else {
      next(new Error('unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    socket.emit('echo', {
      message: 'hello',
    })
  })

  return io
}
