export const assertRouteValid = (...routes: string[]): string => {

    let cleanRouteChunks = routes.map(_route => _route.replace(/^\/+|\/+$/g, ''))

    let joinedRoute = cleanRouteChunks.join('/')

    return '/' + joinedRoute
}
