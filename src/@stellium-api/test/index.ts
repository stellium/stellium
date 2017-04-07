import * as morgan from 'morgan'
import * as express from 'express'
import * as mongoose from 'mongoose'
import * as bodyParser from 'body-parser'
import {V1Router} from "../v1/router";


/**
 * Set up mongoose -> mongodb connection before requiring any routes
 * uses database address assigned in env.js
 */
// (<any>mongoose).Promise = global.Promise;
mongoose.connect('mongodb://localhost/stellium-dev');


export class Server {


    app: express.Application = express();

    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     */
    public static bootstrap(): Server {
        return new Server();
    }


    constructor() {

        this._configure();
    }


    private _configure() {

        // Use logger in development mode
        this.app.use(morgan('dev'));

        this.app.use(bodyParser.json());

        // Template resource routes for dynamic pages
        this.app.use('/api', V1Router());

        this.app.use((req, res, next) => {
            let err = new Error('Not Found');
            err['status'] = 404;
            next(err);
        });
    }
}
