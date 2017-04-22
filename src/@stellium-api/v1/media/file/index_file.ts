import {MediaFileModel} from '../../../../@stellium-database'
import {Monolog} from '../../../../@stellium-common'


export const indexFile = (req, res) => {

    MediaFileModel.find({}, (err, files) => {

        if (err) {

            Monolog({
                message: 'MongoDB failed to index media collection',
                error: err
            })

            res.status(500).send('Internal Server Error')

        } else res.send(files)
    })
}
