import {ApplicationStore, ApplicationStoreSingleton} from './app.store'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/operator/pluck'
import {StoreKeyAddress, StoreKeys} from './keys'
import {type} from 'os'


export class StoreServiceSingleton {


    private store: ApplicationStoreSingleton = ApplicationStore


    observe(storeKey: StoreKeys): Observable<any> {

        return this.store.changes.pluck(StoreKeyAddress(storeKey))
    }


    get(storeKey: StoreKeys | string) {

        const currentState = this.store.getState()

        if (typeof storeKey === 'string') {

            return currentState[storeKey]
        }

        return currentState[StoreKeyAddress(storeKey)]
    }


    update(storeKey: StoreKeys | string, state: any) {

        const currentState = this.store.getState()

        if (typeof storeKey === 'string') {

            this.store.setState(Object.assign({}, currentState, {[storeKey]: state}))

            return
        }

        this.store.setState(Object.assign({}, currentState, {[StoreKeyAddress(storeKey)]: state}))
    }


    add(storeKey: StoreKeys, state: any) {

        const currentState = this.store.getState()

        const collection = currentState[StoreKeyAddress(storeKey)]

        this.store.setState(Object.assign({}, currentState, {[StoreKeyAddress(storeKey)]: [state, ...collection]}))
    }


    findAndUpdate(storeKey: StoreKeys, state) {

        const currentState = this.store.getState()

        const collection = currentState[StoreKeyAddress(storeKey)]

        this.store.setState(Object.assign({}, currentState, {

            [StoreKeyAddress(storeKey)]: collection.map(item => {

                if (item['id'] !== state.id) return item

                return Object.assign({}, item, state)
            })
        }))
    }


    findAndDelete(storeKey: StoreKeys, id) {

        const currentState = this.store.getState()

        const collection = currentState[StoreKeyAddress(storeKey)]

        this.store.setState(Object.assign({}, currentState, {[StoreKeyAddress(storeKey)]: collection.filter(item => item['id'] !== id)}))
    }


    purge() {
        this.store.purge()
    }
}


export const StoreService: StoreServiceSingleton = new StoreServiceSingleton()
