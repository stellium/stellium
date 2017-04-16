import * as express from 'express'
import {Router} from 'express'
import {WebsiteNavigationGroupModel, WebsitePageModel} from '../../../@stellium-database'
import {Monolog} from '../../../@stellium-common'
import {DeletePageCache} from '../resource_cache'


export const WebsitePagesRouter: Router = express.Router()


WebsitePagesRouter.post('/', (req, res) => {

    let pageData = req.body

    if (LOG_ERRORS) console.log('pageData', pageData)

    WebsiteNavigationGroupModel.findOne({}, (err, navGroup) => {

        if (err) {
            Monolog({
                message: 'Error while create new page',
                error: err
            })
        }

        pageData.navigation_group_id = navGroup._id

        if (LOG_ERRORS) console.log('pageData.navigation_group_id', pageData.navigation_group_id)

        // Assign user ID of the authenticated user
        // to the new page document
        pageData.user_id = req.user._id

        if (LOG_ERRORS) console.log('pageData.user_id', pageData.user_id)

        WebsitePageModel.create(pageData, (err, newPage) => {

            if (err) {
                res.status(500).send()
                Monolog({
                    message: 'Failed to create a new page',
                    error: err
                })
                return
            }

            res.send({
                message: 'Page successfully created',
                page: newPage
            })

            DeletePageCache()
        })
    })
})
