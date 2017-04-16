import * as async from 'async'
import * as mongoose from 'mongoose'
import {SeedConsole} from './_lib'
import {UsersSeeder} from './system_users'
import {FilesSeeder} from './media_files'
import {ProductsSeeder} from './ecommerce_products'
import {BlogPostsSeeder} from './blog_posts'
import {NavigationSeeder} from './website_navigation'
import {PagesSeeder} from './website_pages'
import {ENV} from '../../@stellium-common'
import {SettingsSeeder} from './system_settings'
import {CustomCollectionBlueprintSeeder} from './custom_collection_blueprint'
import {CustomCollectionSeeder} from './custom_collection'


export const DatabaseSeeder = (modules: string[] = []) => {

    (<any>mongoose).Promise = global.Promise
    mongoose.connect('mongodb://localhost/' + ENV.database_name);


    SeedConsole("DB Seeder: Started", "green", true);


    const AsyncTask = [
        UsersSeeder,
        SettingsSeeder,
        FilesSeeder,
    ];

    // Paid modules, only seed required data if the modules are activated for the client
    if (modules.includes('blog')) {
        AsyncTask.push(
            BlogPostsSeeder
        )
    }

    if (modules.includes('ecommerce')) {
        AsyncTask.push(
            ProductsSeeder
        )
    }

    if (modules.includes('web')) {
        AsyncTask.push(
            NavigationSeeder,
            PagesSeeder
        )
    }

    if (modules.includes('collection')) {
        AsyncTask.push(
            CustomCollectionBlueprintSeeder,
            CustomCollectionSeeder
        )
    }

    async.series(AsyncTask, err => {
        if (err) {
            console.log(err);
            SeedConsole("DB Seeder: Terminated with errors", "red", true);
        } else {
            SeedConsole("DB Seeder: Completed", "green", true);
        }
        mongoose.connection.close();
        process.exit(0);
    });
};
