import {Request, Response} from 'express'
import {CacheQueryResult} from '../../resource_cache'


export const cleanUserByRole = (collection: any[], request: Request, response: Response) => {

    let filteredUsers = collection.map(_user => {

        if (request.user.role_id > 2) {

            _user = {
                ..._user,
                last_login: undefined,
                updated_at: undefined,
                created_at: undefined,
                deleted_at: undefined,
                role_id: undefined,
                status: undefined
            }
        }

        _user.__v = undefined

        return _user
    })


    // If not MASTER admin
    if (request.user.role_id > 0) {

        // Remove master admin from request if the authenticated user requesting
        // is not the `master` himself
        filteredUsers = filteredUsers.filter(_user => _user.role_id !== 0)
    }

    const ownAccount = filteredUsers.find(_user => _user._id === request.user._id)

    filteredUsers = filteredUsers.filter(_user => _user._id !== request.user._id)

    // Append own user account to the first element
    if (ownAccount) filteredUsers = [].concat(ownAccount, filteredUsers)

    response.send(filteredUsers)

    // Cache query results to redis
    CacheQueryResult(request, filteredUsers)
}
