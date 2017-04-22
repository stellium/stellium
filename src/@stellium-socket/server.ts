import * as async from 'async'
import * as redis from 'redis'
import * as io from 'socket.io'
import * as ioRedis from 'socket.io-redis'
import * as colors from 'colors'
import {
    ENV,
    Monolog,
    CacheKeys,
    CommonErrors,
    SocketEventKeys
} from '../@stellium-common'
import {IncomingConnectionHandler} from './connection_handler'
import {GetPageVisitData} from './controllers/page_visit'
import {GetNumberOfOnlineUsers} from './controllers/online_users'
// import {GetAdminClientSocketId} from './get_admin_id'


const redisClient = redis.createClient({db: ENV.redis_index})


export const SocketServer = (socket) => {

    socket.on('connection', socket => {

        IncomingConnectionHandler(socket)

        socket.on(SocketEventKeys.RequestUserVisits, () => GetPageVisitData(socket))

        socket.on(SocketEventKeys.RequestUserCount, () => GetNumberOfOnlineUsers(socket))

        /*
        SocketService.onMessageRequest$.subscribe(messageTransportData => {

            if (messageTransportData.clientId) {

                GetAdminClientSocketId(messageTransportData.clientId, (err, socketId) => {

                    socket.to(socketId).emit(messageTransportData.eventKey, messageTransportData.payload)
                })

                return
            }

            socket.emit(messageTransportData.eventKey, messageTransportData.payload)
        })
        */
    })
}


export class SocketServerC {


    private socket: SocketIO.Server


    //noinspection JSUnusedGlobalSymbols
    public static bootstrap(socketPort): SocketServerC {

        console.log(colors.blue('Socket server listening on ' + socketPort))

        return new SocketServerC(socketPort)
    }


    constructor(private socketPort: number) {

        const _io = this.socket = io.listen(socketPort)

        _io.adapter(ioRedis())

        this.socket.on('connection', socket => {

            this._incomingConnectionHandler(socket)

            socket.on(SocketEventKeys.RequestUserVisits, () => this._getPageVisitData())

            socket.on(SocketEventKeys.RequestUserCount, () => this._getNumberOfOnlineUsers())

            /*
            SocketService.onMessageRequest$.subscribe(messageTransportData => {

                if (messageTransportData.clientId) {

                    this._getAdminClientSocketId(messageTransportData.clientId, (err, socketId) => {

                        this.socket.to(socketId).emit(messageTransportData.eventKey, messageTransportData.payload)
                    })

                    return
                }

                this.socket.emit(messageTransportData.eventKey, messageTransportData.payload)
            })
            */
        })
    }


    private _incomingConnectionHandler(socketClient) {

        // Whether the connecting user is an admin or a visitor
        const userType = socketClient.handshake.query['client_type']

        if (userType === 'admin') {

            if (LOG_ERRORS) console.log('admin connected')

            this._adminConnectionHandler(socketClient)

            socketClient.on('disconnect', () => this._disconnectAdmin(socketClient))

            return
        }

        if (userType === 'client') {

            if (LOG_ERRORS) console.log('client connected')

            const clientSessionID = socketClient.handshake.query['session_id']

            this._clientConnectionHandler(socketClient, clientSessionID)

            socketClient.on(SocketEventKeys.ClientMetaUpdate, (meta) => this._updateClientMeta(meta, clientSessionID))

            socketClient.on('disconnect', () => this._disconnectClient(socketClient, clientSessionID))

            return
        }

        socketClient.emit('exception', {
            errorMessage: 'You are neither a client nor an admin, what are you?'
        })
    }


    private _getAdminClientSocketId(userId: string, cb: (err: any, socketId: string) => void): void {

        redisClient.get(CacheKeys.AdminIDPrefix + userId, (err, socketId) => {

            if (err) {
                Monolog({
                    message: 'Error retrieving admin client socket ID for ' + userId,
                    error: err
                })
            }

            cb(err, socketId)
        })
    }


    private _adminConnectionHandler(client): void {

        // user id must be provided when establishing a connection from client to server
        const userId = client.handshake.query['user_id']

        const requestToken = client.handshake.query['token']

        if (!requestToken) {
            client.emit('exception', {
                errorMessage: 'No token provided'
            })
            Monolog({
                message: 'Someone attempted to connect to the socket server as admin without providing a token',
                severity: 'moderate'
            })
            return
        }

        redisClient.get(CacheKeys.AdminTokenPrefix + userId, (err, cachedToken) => {

            if (err) {
                client.emit('exception', {
                    errorMessage: CommonErrors.InternalServerError
                })
                Monolog({
                    message: 'Unable to retrieve user signed token',
                    error: err
                })
                return
            }

            if (cachedToken !== requestToken) {
                if (LOG_ERRORS) console.log(colors.red('Token does not match stored token'))
                // Token does not match the token stored in redis
                client.emit('exception', {
                    errorMessage: 'Token mismatch'
                })
                return
            }

            redisClient.set(CacheKeys.AdminIDPrefix + userId, client.id, err => {

                if (err) {
                    client.emit('exception', {
                        errorMessage: CommonErrors.InternalServerError
                    })
                    Monolog({
                        message: 'Unable to store Socket.io on user\'s connection',
                        error: err
                    })
                    return
                }

                this._getNumberOfOnlineUsers()

                this._getOnlineAdmins()

                this._getPageVisitData()
            })
        })
    }


    private _clientConnectionHandler(client, sessionId): void {

        const clientCacheId = CacheKeys.ClientIDPrefix + sessionId

        const clientQuery = client.handshake.query

        let cacheLoad = {
            socketId: client.id,
            count: 1,
            device_type: clientQuery.device_type,
            current_page: clientQuery.current_page
        }

        redisClient.get(clientCacheId, (err, existingCache) => {

            if (existingCache) {

                const existingCacheObject = JSON.parse(existingCache)

                cacheLoad.count += existingCacheObject.count

                cacheLoad.current_page = clientQuery.current_page
            }

            redisClient.set(clientCacheId, JSON.stringify(cacheLoad), err => {

                /**
                 * TODO(production): Error handling
                 * @date - 4/13/17
                 * @time - 11:07 PM
                 */

                this._getNumberOfOnlineUsers()

                this._getOnlineAdmins()

                this._getPageVisitData()
            })
        })
    }


    private _updateClientMeta(meta, sessionId: string): void {

        const clientCacheId = CacheKeys.ClientIDPrefix + sessionId

        redisClient.get(clientCacheId, (err, clientMeta) => {

            const clientAsObject = JSON.parse(clientMeta)

            clientAsObject.current_page = meta.current_page

            clientAsObject.device_type = meta.device_type

            redisClient.set(clientCacheId, JSON.stringify(clientAsObject), err => {

                this._getNumberOfOnlineUsers()

                this._getOnlineAdmins()

                this._getPageVisitData()
            })
        })
    }


    private _redisVisitQuery(key, cb: (err: any, data?: any) => void): void {

        redisClient.get(key, (err, data) => {

            const parsedData = data && JSON.parse(data)

            cb(err, parsedData)
        })
    }


    private _getPageVisitData(): void {

        redisClient.keys(CacheKeys.ClientIDPrefix + '*', (err, keys) => {

            if (err) {
                this.socket.emit('exception', {
                    errorMessage: CommonErrors.InternalServerError
                })
                Monolog({
                    message: 'Error retrieving client keys for socket users',
                    error: err
                })
                return
            }

            async.map(keys, this._redisVisitQuery, (err, data) => {

                if (err) {
                    this.socket.emit('exception', {
                        errorMessage: CommonErrors.InternalServerError
                    })
                    Monolog({
                        message: 'Failed to asynchronously map user visits for Socket poll',
                        error: err
                    })
                    return
                }

                this.socket.emit(SocketEventKeys.RequestUserVisits, data)
            })
        })
    }


    private _getNumberOfOnlineUsers(): void {

        redisClient.keys(CacheKeys.ClientIDPrefix + '*', (err, keys) => {

            this.socket.emit(SocketEventKeys.RequestUserCount, keys.length)
        })
    }


    private _getOnlineAdmins(): void {

        redisClient.keys(CacheKeys.AdminIDPrefix + '*', (err, keys) => {

            this.socket.emit(SocketEventKeys.OnlineAdminCount, keys.length)
        })
    }


    private _disconnectAdmin(client): void {

        const adminId = client.handshake.query['user_id']

        redisClient.del(CacheKeys.AdminIDPrefix + adminId, err => {

            /**
             * TODO(fix): Error Handling
             * @date - 4/15/17
             * @time - 11:30 AM
             */

            this._getOnlineAdmins()
        })
    }


    private _disconnectClient(client, clientSessionId): void {

        const cacheKey = CacheKeys.ClientIDPrefix + clientSessionId

        redisClient.get(cacheKey, (err, existingMeta) => {

            if (existingMeta) {

                const existingMetaObject = JSON.parse(existingMeta)

                // If the user has connected through multiple connections
                // simply reduce the connection count by one
                if (existingMetaObject.count > 1) {

                    existingMetaObject.count -= 1

                    redisClient.set(cacheKey, JSON.stringify(existingMetaObject), err => {

                        /**
                         * TODO(production): Error handler
                         * @date - 4/14/17
                         * @time - 3:20 AM
                         */

                        this._getNumberOfOnlineUsers()

                        this._getPageVisitData()
                    })

                    return
                }

                // If the user only has 1 active connection, completely remove
                // user connection from cache
                redisClient.del(cacheKey, err => {

                    if (err) {
                        Monolog({
                            message: 'Unable to delete connected user from redis',
                            error: err
                        })
                        return
                    }

                    this._getNumberOfOnlineUsers()

                    this._getPageVisitData()
                })
            }
        })
    }
}
