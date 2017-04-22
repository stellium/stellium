import * as http from 'http'
import {ENV} from '../@stellium-common'


const mediaServer = http.createServer().listen(`${ENV.port}3`)

mediaServer.on('request', (req, res) => {

})
