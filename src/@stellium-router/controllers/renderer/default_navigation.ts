import {
    WebsiteNavigationGroupModel,
    readSeederFile
} from '../../../@stellium-database'
import {ENV} from '../../../@stellium-common'
import {WebsiteNavigationGroupSchema} from '../../../@stellium-common'


export const getDefaultNavigationItems = (cb: (err: any, items?: WebsiteNavigationGroupSchema) => void): void => {

    if (ENV.render_from_json) {
        readSeederFile('navigation', (err, navigation) => {
            let navGroup = {
                title: "Main",
                'default': true,
                children: navigation
            };
            cb(null, navGroup);
        });
    } else {
        WebsiteNavigationGroupModel
        .findOne({})
        .populate('navigation')
        .exec((err, navGroup) => {
            cb(err, navGroup);
        });
    }
};