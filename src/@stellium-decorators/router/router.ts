import * as express from 'express'
import {Router} from 'express'


export class BaseRxRouter {

    protected _router: Router


    constructor() {

        this._router = express.Router()
    }
}


export function RxRouter(): any {


    return function (target, property, descriptor) {

        // save a reference to the original constructor
        const original = target

        // a utility function to generate instances of a class
        function construct(constructor, args) {
            const c: any = function () {
                return constructor.apply(this, args)
            }
            c.prototype = constructor.prototype
            return new c()
        }

        // the new constructor behaviour
        const f: any = function (...args) {
            console.log('New: ' + original.name)
            return construct(original, args)
        }

        // copy prototype so intanceof operator still works
        f.prototype = original.prototype

        // return new constructor (will override original)
        return f
    }
}
