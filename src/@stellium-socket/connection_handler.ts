import {SocketEventKeys} from '../@stellium-common'
import {AdminConnectionHandler} from './connect_admin'
import {DisconnectAdmin} from './disconnect_admin'
import {DisconnectClient} from './disconnect_client'
import {UpdateClientMeta} from './update_client_meta'
import {ClientConnectionHandler} from './connect_client'


export const IncomingConnectionHandler = (socketClient) => {

    // Whether the connecting user is an admin or a visitor
    const userType = socketClient.handshake.query['client_type']

    if (userType === 'admin') {

        if (LOG_ERRORS) console.log('admin connected')

        AdminConnectionHandler(socketClient)

        socketClient.on('disconnect', () => DisconnectAdmin(socketClient))

        return
    }

    if (userType === 'client') {

        if (LOG_ERRORS) console.log('client connected')

        const clientSessionID = socketClient.handshake.query['session_id']

        ClientConnectionHandler(socketClient, clientSessionID)

        socketClient.on(SocketEventKeys.ClientMetaUpdate, (meta) => UpdateClientMeta(socketClient, meta, clientSessionID))

        socketClient.on('disconnect', () => DisconnectClient(socketClient, clientSessionID))

        return
    }

    socketClient.emit('exception', {
        errorMessage: 'You are neither a client nor an admin, what are you?'
    })
}
