/**
 * Set header options to allow CORS
 * @param req
 * @param res
 * @param next
 */
export const addStelliumHeaders = (req, res, next) => {

    // Allow all origins, for now TODO
    // res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Stellium-Domain')
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')

    // Browser check for pre-flight request to determine whether the server is webDav compatible
    if ('OPTIONS' == req.method) {
        res.sendStatus(204);
    }
    else next()
}