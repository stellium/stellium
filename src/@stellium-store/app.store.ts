import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import 'rxjs/add/operator/distinctUntilChanged'
import {Observable} from 'rxjs/Observable';


export class StoreState {}


// These are the keys that should be stored in the browser's localStorage
// we save these to the AppStore when the user refreshes the browser for quick retrieval
const defaultState: StoreState = {}


const INIT_STORE = new BehaviorSubject<StoreState>(defaultState)


export class ApplicationStoreSingleton {


    private _store = INIT_STORE


    changes: Observable<StoreState> = this._store.asObservable().distinctUntilChanged()


    setState(value) {
        this._store.next(value)
    }


    getState(): StoreState {
        return this._store.value
    }


    purge() {
        this._store.next(defaultState)
    }
}


/**
 * Instantiate the class only once to ensure it is a singleton
 * We need the store to be a singleton to make sure it's
 * properties are always in sync across our app.
 *
 * @type {ApplicationStoreSingleton}
 */
export const ApplicationStore = new ApplicationStoreSingleton()
