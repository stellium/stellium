import * as express from 'express'
import * as moment from 'moment'
import {Router} from 'express'
import {WebsiteNavigationGroupModel} from '../../../@stellium-database/models/website_navigation_group'
import {Monolog} from '../../../@stellium-common/monolog/monolog'
import {WebsitePageModel} from '../../../@stellium-database/models/website_page'
import {deletePageCache} from '../dynamic_router/dynamic_routes'


export const WebsitePagesRouter: Router = express.Router()



WebsitePagesRouter.post('/', (req, res) => {

    let pageData = req.body

    console.log('pageData', pageData)

    WebsiteNavigationGroupModel.findOne({}, (err, navGroup) => {

        pageData.navigation_group_id = navGroup._id

        console.log('pageData.navigation_group_id', pageData.navigation_group_id)

        pageData.user_id = req.user._id

        console.log('pageData.user_id', pageData.user_id)

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

            deletePageCache()
        })
    })
})
