const Reflect = global['Reflect']


export function Inject(target: any, key: string): any {

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


export function Injectable(): any {

    return function <ServiceType>(target): ServiceType {

        const InjectableSingletonKey = Symbol.for(target.name as string)

        const globalSymbol = Object.getOwnPropertySymbols(global)

        const singletonInitialized = globalSymbol.indexOf(InjectableSingletonKey) > -1

        if (!singletonInitialized) {

            // If singleton of this type has not been initialized yet,
            // assign a new instance of the singleton to the global namespace
            // this ensures that we have create a singleton for this instance
            global[InjectableSingletonKey] = new target()
        }

        // Initialize the singleton API for SocketService
        const InjectableSingleton: ServiceType = new target()

        Object.defineProperty(InjectableSingleton, 'instance', {
            get: () => global[InjectableSingletonKey]
        })

        // Ensure the API is never changed
        Object.freeze(InjectableSingleton)

        // Return reference to singleton
        return InjectableSingleton
    }
}
