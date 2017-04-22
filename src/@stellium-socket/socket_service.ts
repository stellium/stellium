import {Observable} from 'rxjs/Observable'
import {Subject} from 'rxjs/Subject'
// import {Injectable} from '../@stellium-decorators/injectable'


export interface MessageTransportRequest {
    eventKey: string
    payload: any
    clientId?: string
}


// @Injectable()
export class SocketServiceInjector {


    private _onMessageRequest: Subject<MessageTransportRequest> = new Subject


    /**
     * Observable
     * @type {Observable<MessageTransportRequest>}
     */
    onMessageRequest$: Observable<MessageTransportRequest> = this._onMessageRequest.asObservable()


    /**
     * Request socket connection to send message to client
     * @param eventKey
     * @param payload
     * @param clientId
     */
    $requestMessageTransport(eventKey: string, payload: any, clientId: string = null): void {

        this._onMessageRequest.next({eventKey, payload, clientId})
    }
}

export const SocketService: SocketServiceInjector = <any>SocketServiceInjector
