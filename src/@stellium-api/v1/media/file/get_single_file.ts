import {MediaFileModel} from '../../../../@stellium-database'
import {Monolog} from '../../../../@stellium-common'


export const getFileById = (req, res) => {

    MediaFileModel.findById(req.params['fileId'], (err, file) => {

        if (err) {

            Monolog({
                message: 'Failed to retrieve file document',
                error: err
            })

            res.status(500).send('Internal Server Error')

        } else res.send(file)
    })
}
