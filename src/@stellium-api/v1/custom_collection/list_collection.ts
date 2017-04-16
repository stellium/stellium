import {CustomCollectionBlueprintModel} from '../../../@stellium-database'


export const CustomCollectionIndexController = (req, res) => {

    CustomCollectionBlueprintModel
        .find({})
        .populate('members')
        .exec((err, collections) => {

            res.send(collections)
        })
}
