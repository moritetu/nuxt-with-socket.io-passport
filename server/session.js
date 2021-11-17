import session from 'express-session'

const ses = session({ secret: 'secret', resave: true, saveUninitialized: true })
export default ses
