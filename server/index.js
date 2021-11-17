import express from 'express'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import session from './session'

const app = express()

const USERS = [
  {
    username: 'username1',
    password: 'password1',
  },
]

app.use(session)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())
passport.use(
  new LocalStrategy(function (username, password, done) {
    const user = USERS.find(
      (data) => data.username === username && data.password === password
    )
    if (!user) {
      return done(null, false)
    }

    return done(null, { username: user.username })
  })
)

passport.serializeUser(function (user, done) {
  done(null, user)
})
passport.deserializeUser(function (user, done) {
  done(null, user)
})

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
  }),
  (req, res, next) => {
    res.json(req.user)
  }
)

app.post('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/')
})

app.get('/session', (req, res, next) => {
  res.json(req.user)
})

export default app
