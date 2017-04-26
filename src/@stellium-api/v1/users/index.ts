import * as express from 'express'
import {Router} from "express"
import {createNewUser} from './controllers/create_user'
import {getAuthUser} from './controllers/get_auth_user'
import {updateUserPassword} from './controllers/update_password'
import {updateUser} from './controllers/update_user'
import {deleteUser} from './controllers/delete_user'
import {getAllUsers} from './controllers/get_all_users'
import {getUserById} from './controllers/get_user_by_id'


export const UsersRouter: Router = express.Router()


UsersRouter.get('/', getAllUsers)


UsersRouter.get('/:userId', getUserById)

/**
 * Creates a new user
 */
UsersRouter.post('/', createNewUser)


UsersRouter.put('/self', getAuthUser)


UsersRouter.put('/password', updateUserPassword)


/**
 * Updates a user based on it's id
 */
UsersRouter.put('/:modelId', updateUser)


/**
 * Deletes a user based on it's id
 */
UsersRouter.delete('/:userId', deleteUser)
