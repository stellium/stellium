import * as async from 'async'
import {SeedConsole, FindOneUser, readSeederFile} from './_lib'
import {WebsiteNavigationModel} from '../models/website_navigation'
import {WebsiteNavigationGroupModel} from '../models/website_navigation_group'


const removeNavigation = (cb: (err: any) => void): void => {
    const removeNav = (cb) => WebsiteNavigationModel.remove({}, err => cb(err));
    const removeNavGroup = (cb) => WebsiteNavigationGroupModel.remove({}, err => cb(err));
    async.parallel([
        removeNav,
        removeNavGroup,
    ], err => cb(err));
};


const seedNavigation = (cb: (err: any) => void): void => {

    const createNavGroup = (user, cb) => {
        WebsiteNavigationGroupModel.create({title: 'Main Navigation', default: true, user_id: user._id},
            (err, navGroup) => cb(err, navGroup, user));
    };

    const seedNavigation = (navGroup, user, cb) => {

        const setupAndSeed = (navItem, cb: (err: any) => void): void => {
            navItem['user_id'] = user._id;
            navItem['group_id'] = navGroup._id;
            WebsiteNavigationModel.create(navItem, err => cb(err));
        };

        readSeederFile('navigation', (err, navigation) => {
            async.map(navigation, setupAndSeed, err => cb(err));
        });
    };

    async.waterfall([
        FindOneUser,
        createNavGroup,
        seedNavigation,
    ], err => cb(err));
};


export const NavigationSeeder = (cb: (err: any) => void) => {
    SeedConsole("Seeding Navigation");
    async.series([
        removeNavigation,
        seedNavigation
    ], err => cb(err))
};
