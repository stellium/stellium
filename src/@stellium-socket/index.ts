import * as express from 'express'
import {ENV} from '../@stellium-common'
import {SocketServer} from './server'
const http = require('http')


const app = express()
const server = http.Server(app)

SocketServer.bootstrap(server)

const socketPort = ENV.port + '5'

server.listen(socketPort, () => {

    console.log('Socket up on', socketPort)
})
