import {Application, Router} from 'express'


export const ErrorHandler = (app: Application | Router) => {

    app.use((req, res, next) => {

        let err = new Error('Not Found')

        err['status'] = 404

        next(err)
    })
}
