import * as async from 'async';
import * as moment from 'moment';
import {SeedConsole, FindOneUser, readSeederFile} from "./_lib";
import {WebsitePageModel} from "../models/website_page";
import {WebsiteNavigationGroupModel} from "../models/website_navigation_group";


const removePages = (cb: (err: any) => void): void => {
    WebsitePageModel.remove({}, err => cb(err))
};


const getDefaultNavigation = (user, cb) => {
    WebsiteNavigationGroupModel.findOne({}, (err, nav) => cb(err, nav, user));
};


const iterateAndSavePages = (navGroup, user, cb) => {

    let it = 0;
    const seedPage = (page, cb) => {

        // Re-order the modules to make sure they do not have any duplicate
        // order identifiers which would likely break the page editor
        page.modules = page.modules.map((_module, index) => {
            _module.order = (index + 1)
            return _module
        })

        page.navigation_group_id = navGroup._id;
        page.user_id = user._id;
        page.created_at = moment().subtract(++it, 'days');
        page.updated_at = moment().subtract(it, 'days');
        WebsitePageModel.create(page, err => cb(err));
    };

    readSeederFile('pages', (err, pages) => {
        async.map(pages, seedPage, err => cb(err));
    });
};


const seedPages = (cb: (err: any) => void): void => {

    async.waterfall([
        FindOneUser,
        getDefaultNavigation,
        iterateAndSavePages,
    ], err => cb(err));
};


export const PagesSeeder = (cb: (err: any) => void) => {
    SeedConsole("Seeding Pages");
    async.series([
        removePages,
        seedPages
    ], err => cb(err))
};
