import {ENV} from '../@stellium-common'
import {SocketServerC} from './server'

const socketPort = ENV.port + '5'

SocketServerC.bootstrap(socketPort)
