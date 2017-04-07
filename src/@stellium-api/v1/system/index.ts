import * as express from 'express'
import {Router} from 'express'
import {UsersRouter} from './user'
import {SystemSettingsRouter} from "./settings";
// import {LanguageRouter} from "./languages";


export const SystemBundleRouter: Router = express.Router();

// SystemBundleRouter.use('/languages', LanguageRouter);

SystemBundleRouter.use('/users', UsersRouter);

SystemBundleRouter.use('/settings', SystemSettingsRouter);
