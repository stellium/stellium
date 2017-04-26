import {SystemUserModel} from '../../../../@stellium-database'


export const checkForConflict = (_id: string, field: string, value: any, cb: (err: any) => void): void => {

    const query = {
        [field]: value
    }

    if (_id) {
        query._id = {
            '$ne': _id
        }
    }

    SystemUserModel
    .findOne(query)
    .exec((err, user) => {

        let error = null

        if (err) error = err

        else if (user) error = {type: 'conflict', field: field}

        cb(error)
    })
}
