import * as redis from 'redis'
import {NextFunction, Request, Response} from 'express'
import {Observable} from 'rxjs/Observable'
import {Subject} from 'rxjs/Subject'


function Singleton(): any {

    return function (target: any, key: string, descriptor: any): any {

    }
}

function FxRouter(target?: any): any {
}

function FxGet(url: string = '/'): any {
}

function FxPost(url: string = '/'): any {
}

function FxPut(url: string = '/'): any {
}

function FxPatch(url: string = '/'): any {
}

function FxDelete(url: string = '/'): any {
}

function FxRoleGuard(roleIds: number | number[]) {

    const role_ids = [].concat([], roleIds)

    return function (target: any, key: string): any {

    }
}


// Error suppressors
declare const SystemUserModel: any


@Singleton()
export class RedisStore {


    protected _redisClient


    constructor() {

        this._redisClient = redis.createClient({db: 1})

        // Make this service inherit all redis command
        for (let prop of this._redisClient) {

            if (this._redisClient.hasOwnProperty(prop)) {

                this[prop] = this._redisClient[prop]
            }
        }
    }
}


// error suppressors
declare class MessageTransportMetadata {
    clientId: string
    eventKey: string
    payload?: any
    storeToDb?: boolean
}
/**
 * Example implementation of using the socket.io connection across
 * the server.
 */
@Singleton()
export class SocketService {


    private _onTransportRequest: Subject<MessageTransportMetadata> = new Subject


    /**
     * Observable that the main socket class is listening to
     * will send / emit messages when request by an external class / ???
     *
     * @type {Observable<any>}
     */
    onTransportRequest$: Observable<MessageTransportMetadata> = this._onTransportRequest.asObservable()


    /**
     *
     * @whatItDoes Request the socket connection to push a message to a connected
     * client from anywhere in the app, falls back to email notification if the
     * client is not online / available
     *
     *
     * @howToUse
     * Inject SocketService into your Router
     *
     * \@FxRouter
     * export class FxAnalyticsRouter {
     *
     *     constructor(private socketService: SocketService) {
     *
     *         socketService.$requestMessageTransport({
     *             clientId: 'documentIdOfTheUser',
     *             eventKey: 'name:of:event',
     *             payload: {
     *                 data: 'any type of data',
     *                 notification: 'Hi there',
     *                 any_property: 97391863
     *             },
     *             storeToDb: true
     *         })
     *     }
     * }
     *
     */
    $requestMessageTransport(metadata: MessageTransportMetadata): void {

        this._onTransportRequest.next(metadata)
    }
}


@FxRouter
export class FxAuthRouter {


    // FxRouter injects a singleton of SocketService
    // Adding rxjs capabilities to the server app
    constructor(private socketService: SocketService,
                private redisStore: RedisStore) {
    }


    @FxPost('authenticate')
    login(req: Request, res: Response, next: NextFunction): void {

        SystemUserModel.findOne({email: req.params.email}, (err, user) => {

            if (!user) {
                next()
            }
        })
    }


    @FxGet('profile')
    userProfile(req: Request, res: Response, next: NextFunction): void {
    }


    @FxPut()
    @FxRoleGuard(1)
    updateProfile(req, res, next): void {
    }


    @FxDelete()
    logout(req, res): void {
        req.user._id = undefined
    }
}
