import * as express from 'express';


export class ErrorsHandler {


    public app: express.Application;


    constructor(_app: express.Application) {

        this._configure(_app);
    }


    private _configure(_app) {

        this.app = _app;

        // Catch 404 if none of the above routes are hooked
        this.app.use((req, res, next) => {
            let err = new Error('Not Found')
            err['status'] = 404
            next(err)
        })
    }


    private notFoundHandler(req, res): void {

    }
}
