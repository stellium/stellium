import * as fs from 'fs'
import * as path from 'path'
import {MediaFileModel} from '../../../../@stellium-database'
import {MediaPath, Monolog} from '../../../../@stellium-common'


export const deleteFile = (req, res) => {

    const fileIdToBeDeleted = req.params.fileId

    MediaFileModel.findById(fileIdToBeDeleted, (err, _file) => {

        if (err) {
            Monolog({
                message: 'Error retrieving file document while attempting to delete, file ID: ' + fileIdToBeDeleted,
                error: err
            })
            res.status(500).send('Error deleting file')
            return
        }

        fs.unlink(path.resolve(MediaPath, _file.url), (err) => {

            if (err) {
                Monolog({
                    message: 'Error deleting file from storage for ' + _file.url,
                    error: err
                })
                res.status(500).send('An error occurred while trying to delete the selected file.')
                return
            }

            _file.remove((err) => {

                if (err) {
                    Monolog({
                        message: 'Error attempting to remove file from database for ' + _file.url,
                        error: err
                    })
                    res.status(500).send('An error occurred while trying to delete the file from the database')
                    return
                }

                res.send({
                    message: 'File has been deleted successfully.'
                })
            })
        })
    })
}
