import * as fs from 'fs'
import * as ejs from 'ejs'
import * as css from 'css'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import * as moment from 'moment'
import * as cheerio from 'cheerio'
import * as nodeSass from 'node-sass'
import * as memoryCache from 'memory-cache'
import {Request} from 'express'
import {
    LanguageKeys,
    MediaPath,
    ViewsPath,
    CachePath,
    ENV, AppEnvironment,
    ReservedPageKeys,
    URLTranslator,
    SettingsKeys,
    CacheKeys,
    Translatable,
    WebsitePageSchema,
    SystemSettingsSchema,
    WebsitePageModuleSchema
} from '../@stellium-common'
import ReadWriteStream = NodeJS.ReadWriteStream
import {toJSON} from "./lib/to_json"


let ModuleCachePrefix = 'module_cache_id-'


const EnsureUrlValid = (...urls: string[]): string => {

    urls.forEach((_url, index, all) => {
        all[index] = _url.replace(/^\/+|\/+$/g, '')
    })

    return urls.join('/')
};


export interface ModuleCompilerConfig {
    unique?: boolean
    isSection?: boolean
}


export class TemplateFunctions {


    get env(): AppEnvironment {
        return ENV;
    }


    get SettingsKeys(): any {
        return SettingsKeys
    }


    get BASE_URL(): string {
        return this.env.base_url
    }


    get ReservedPageKeys() {
        return ReservedPageKeys
    }


    URLTranslator


    internalURL(urlKey: ReservedPageKeys) {
        return this.URLTranslator(urlKey)
    }


    sortArrayBy(key: string = "order") {
        return (a, b) => {
            if (a[key] < b[key])
                return -1
            if (a[key] > b[key])
                return 1
            return 0
        }
    }


    /** Currently active website language / locale, e.g `en`, `id` etc. */
    currentLanguage: string


    /** System's default website language / locale, e.g `en`, `id` etc. */
    defaultLanguage: string


    /** Available languages if website has multiple languages */
    availableLanguages: string[]


    /** Moment library accessible from template environment */
    moment = moment


    projectSettings: SystemSettingsSchema[]


    __request: Request


    iFrameMode: boolean


    constructor(private req: Request) {
        this.__request = req
        this.iFrameMode = req.app.get('iframe')
        this.projectSettings = req.app.get(CacheKeys.SettingsKey)
        this.currentLanguage = req.app.get(LanguageKeys.CurrentLanguage)
        this.defaultLanguage = req.app.get(LanguageKeys.DefaultLanguage)
        this.availableLanguages = req.app.get(LanguageKeys.AvailableLanguages)
        this.URLTranslator = URLTranslator(this.currentLanguage)
    }


    get __URL__(): string {
        return this.__request.originalUrl
    }


    get lang(): string {
        return this.currentLanguage
    }


    translateUrl(url: { [code: string]: string }): string {

        let translatedUrl = '',
            isOnDefaultLanguage = this.currentLanguage === this.defaultLanguage

        if (isOnDefaultLanguage) {

            translatedUrl = url[this.currentLanguage]
        } else {

            translatedUrl = EnsureUrlValid(this.currentLanguage, url[this.currentLanguage])
        }

        return translatedUrl
    }


    switchLanguage(lang: string): string {

        let url = ''
        let currentUrl = this.__URL__

        if (lang === this.defaultLanguage) {
            url = currentUrl
        } else {
            url = EnsureUrlValid(lang, currentUrl)
        }

        return url
    }


    public getSettingsByKey(settingsKey: string): string {

        const _settings = this.projectSettings && this.projectSettings.find(_setting => _setting.key === settingsKey)

        return _settings && _settings.value || null
    }


    /**
     * TODO(boris): make it work bitch
     * @date - 09 Jan 2017
     * @time - 3:10 PM
     */
    /**
     * Whether the currently visited page is the home page
     * @returns {boolean}
     */
    get isHomePage(): boolean {

        return true
        // return this.app.url === '/home';
    }


    /**
     * source - media, exter
     * @returns {string}
     */
    getMediaUrl({source, url}): string {

        // some-file-in-media-path.jpg -> base-domain.com/media/some-file-in-media-path.jpg
        if (source === 'media') {
            return 'media/' + encodeURIComponent(url)
        }

        // http://some-domain.com/some-image.jpg
        if (source === 'external') {
            return url
        }

        else return url
    }


    currencyFormat(amount: number, currency: string = 'IDR', fractionDigits: number = 0) {

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: fractionDigits,
        }).format(amount);
    }


    getPublicPath(url: string): string {

        return path.resolve(MediaPath, url);
    }


    getModulePath(path: string): string {

        let [, templateFile] = path.split('/')

        return 'modules/' + path + '/' + templateFile + '.section'
    }


    getEmbeddedLink(link: { type: string, url: string }, stripHash = false): string {

        let result = 'undefined';

        switch (link.type) {
            case 'internal':
                result = link.url === 'home' ? '/' : link.url;
                break;
            case 'external':
                const hasPrefix = link.url.match(/^https?/)
                result = hasPrefix ? link.url : 'http://' + link.url
                break;
            case 'anchor':
                result = '#anchor-id-' + this._moduleIndex
                break;
            case 'pdf':
                result = 'c/pdf/' + link.url;
                break;
        }
        return stripHash ? result.replace(/^#/, '') : result;
    }


    private _stelliumLinkCompiler(text,
                                  link: { type: string, url: string },
                                  attributes: any = {}): string {

        const basicLinkTemplate = `<a href="${this.getEmbeddedLink(link)}">${text}</a>`

        const $ = cheerio.load(basicLinkTemplate)

        const linkElement = $('a')

        for (let i in attributes) {
            if (attributes.hasOwnProperty(i)) {
                linkElement.attr(i, attributes[i])
            }
        }

        linkElement.attr('data-stellium-link-type', link.type)

        // Returns the modified element as string
        return $.html()
    }


    get DOMCompiler(): any {

        return {
            // Create links
            // although annoying and obscure, we need to deconstruct the parameters
            // to ignore tslint's complaints about parameters not matching
            Link: (...args: any[]) => this._stelliumLinkCompiler(args[0], args[1], args[2])
        }
    }


    /**
     * Return stylesheet links to component scss files
     */
    getStylesUrl(page: WebsitePageSchema): string {

        const templatePaths = page.modules.map(_module => _module.template);

        let styleUrls = '',
            addedStylesheets = [];

        templatePaths.forEach(templatePath => {

            // Only check for the stylesheet file if it has not been added yet
            if (addedStylesheets.indexOf(templatePath) < 0) {

                try {
                    // Path to the styles file, if exist
                    // e.g /var/www/projects/some-domain.com/web/views/sections/forms/contact
                    const stylesPath = path.resolve(ViewsPath, 'modules', templatePath, 'component.scss')

                    // Check if file exists, we need to do this synchronously so the template renderer waits for the URL
                    // to be resolved before rendering the page, do not worry about clogging up node.js as these will
                    // cached and only called the first a page is visited. Page caching will be invoked when page data
                    // is being seeded just before deploying a project to production
                    fs.accessSync(stylesPath, fs['F_OK'])

                    // If file exists, append stylesheet link to the styleUrls collection
                    styleUrls += `<link rel="stylesheet" type="text/css" stellium-hot href="c/css/${templatePath}/component.css">`

                    addedStylesheets[addedStylesheets.length] = templatePath

                } catch (e) {
                    // Module has no dedicated stylesheet file, skip
                }
            }
        })

        return styleUrls
    }


    getJsDependencies(modules: WebsitePageModuleSchema[]): string {

        if (modules && modules.length) {

            let _scriptBundle = ''

            modules.forEach(module => {

                try {

                    let scriptPath = path.resolve(CachePath, 'js', module.template, 'component.js')
                    fs.readFileSync(scriptPath, 'utf-8')
                    _scriptBundle +=
                        `<script type="text/javascript" stellium-hot-script src="c/js/${module.template}/component.js"></script>`

                } catch (e) {
                    // The js file for this module does not exist, so do not return it's stylesheet URL
                }
            })

            return _scriptBundle
        }

        else return ''
    }


    /**
     * Returns translatable of the currently active language
     * Fallback to default language if translated content is empty or undefined
     * @param translatable
     * @param fallback
     * @returns {string}
     */
    translate(translatable: Translatable, fallback: string): string {

        // If undefined, try to return translatable of default language
        if (typeof translatable[this.lang] === 'undefined' || translatable[this.lang] == '') {

            // If default is also undefined, return empty string
            if (typeof translatable[this.defaultLanguage] == 'undefined') {

                if (!!fallback) {
                    return fallback;
                }

                return '';
            }
            // Return translatable in default language
            return translatable[this.defaultLanguage];
        }

        // Return translatable in requested language
        return translatable[this.lang]
    }


    private _createUniqueModuleIdentifier(length: number): string {

        let identifier = '';
        let chars = 'abcdefghijklmnopqrstuvwxyz';
        let charLength = chars.length;

        for (let i = 0; i < length; i++) {
            identifier += chars.charAt(Math.floor(Math.random() * charLength));
        }

        return identifier;
    }


    private _moduleIndex: number = 0;
    private _moduleOrder: number = 0;


    private _compileJsFiles(moduleData: any): void {

        /**
         * TODO(enable): Enable when fixed
         * @date - 06 Apr 2017
         * @time - 6:54 PM
         */
        /*
         let sourceScriptPath = path.resolve(ViewsPath, 'modules', moduleData.template, 'component.js')

         let targetScriptPath = path.resolve(CachePath, 'js', moduleData.template)

         try {
         fs.accessSync(path.resolve(targetScriptPath, 'component.js'))
         // the compiled script already exists, skip
         return
         } catch (e) {
         // move on as the script does not exist yet
         }

         try {
         fs.accessSync(sourceScriptPath)
         } catch (e) {
         return
         }

         mkdirp.sync(targetScriptPath)

         browserify(sourceScriptPath)
         .transform(babelify, {presets: ["es2015"]})
         .transform(<(file: string, opts?: any) => ReadWriteStream>uglify)
         .bundle()
         .pipe(fs.createWriteStream(path.resolve(targetScriptPath, 'component.js')))
         */
    }


    private _shimCssRules(moduleData: any): void {

        let scssPath = path.resolve(ViewsPath, 'modules', moduleData.template, 'component.scss')

        try {
            fs.accessSync(scssPath)
        } catch (e) {
            // we don't really care move on
            return
        }

        // CSS results as string, converted from buffer
        let cssString = nodeSass.renderSync({file: scssPath})

        // CSS as JSON
        let astCss = css.parse(cssString.css.toString('UTF-8'))

        astCss.stylesheet.rules.forEach(cssRule => {

            /**
             * TODO(bug): Doesn't play well with pseudo selectors
             * @date - 14 Mar 2017
             * @time - 1:37 PM
             */
            cssRule['selectors'] = cssRule['selectors'].map(_rule => {

                if (_rule.includes(':')) {

                    let pseudoDelimited = _rule.split(':')

                    return pseudoDelimited.join(`[${this._moduleComponentId}]:`)
                }
                return `${_rule}[${this._moduleComponentId}]`
            })
        })

        // Convert CSS AST to string
        let shimmedCssString = css.stringify(astCss)

        // Assert that the directory to the components css exists
        mkdirp.sync(path.resolve(CachePath, 'css', moduleData.template))

        fs.writeFileSync(
            path.resolve(CachePath, 'css', moduleData.template, 'component.css'),
            shimmedCssString,
            {encoding: 'UTF-8'}
        )
    }


    private _shimHtmlElements(moduleData: any,
                              isSection: boolean): string {

        let modulePath = path.resolve(ViewsPath, 'modules', moduleData.template, 'component.ejs');

        let cachedComponentId = memoryCache.get(ModuleCachePrefix + moduleData.template);

        if (cachedComponentId) this._moduleComponentId = cachedComponentId;

        // bind template globals to the injected data to be rendered
        let templateData = {
            module: moduleData,
            moduleId: this._moduleIndex,
            ...toJSON(this)
        }

        // EJS file read to string
        let ejsString = fs.readFileSync(modulePath, 'utf8');

        // EJS compiled to HTML
        let renderedTemplate = ejs.render(ejsString, templateData, {cache: false})

        // Load template into a new cheerio instance
        let $ = cheerio.load(renderedTemplate);

        // All elements to be shimmed
        let allElements = $('*');

        // Find the very first HTML element of the component
        const moduleElement = allElements.first();


        /**
         * TODO(DEDE): How to create an anchor link target inside a module
         * @date - 22 Mar 2017
         * @time - 4:20 AM
         */
        /**
         * If the module has an anchor link set, we will prepend a dummy target to the first element of the module
         * Page data example:
         * {
         *      ...
         *      modules: [
         *          {
         *              ...
         *              order: 1,
         *              anchor_link: 'super-villa',
         *              ...
         *          }
         *      ],
         *      ...
         * }
         *
         * Button config:
         * {
         *      ...
         *      type: 'anchor',
         *      link: 'super-villa'
         *      ...
         * }
         */
        // Prepend `anchor link target` if the section is set up as an anchor target
        moduleElement.prepend(`<span class="anchor-target" id="anchor-id-${this._moduleIndex}"></span>`)

        // Set module template name
        if (!this.iFrameMode) moduleElement.attr('mt-stellium-module-template', moduleData.template)

        if (isSection && this.iFrameMode) {

            // Assign stellium class for click handling in page editor
            moduleElement.addClass('mt-stellium-module')

            // Assign stellium module order number for Stellium medium sorting
            moduleElement.attr('mt-stellium-module-order', ++this._moduleOrder)

            // Assign stellium module order number for Stellium medium sorting
            moduleElement.addClass('mt-stellium-module-order')
        }

        allElements.attr(this._moduleComponentId, '')

        const templateAsString = $.html()

        if (!DEVELOPMENT) return templateAsString

        // Return the manipulated HTML Element as string
        // add comment if in Dev mode
        return `<!-- module-start:${moduleData.template} -->${templateAsString}<!-- module-end:${moduleData.template} -->`
    }


    private _moduleComponentId: string;


    /**
     *
     * @param moduleData
     * @param config - true if every stylesheet and script files should be shimmed individually,
     *                 false if the module can share template, styles and scripts
     * @returns {string}
     */
    moduleCompiler(moduleData: any, config: ModuleCompilerConfig = {}): string {


        config.isSection = config.isSection || false;
        config.unique = config.unique || true;

        if (typeof moduleData === 'string') {
            moduleData = {
                template: moduleData
            }
        }

        let moduleIndex = config.unique
            ? ++this._moduleIndex
            : (this._moduleIndex + 1);


        // Unique module identifier that will be added to all elements in the current module's template
        // __mt-module-fxe-7
        this._moduleComponentId = `__mt-module-${this._createUniqueModuleIdentifier(3)}-${moduleIndex}`;


        // Checks if the stylesheet for this module has been cached before, we only need it cached once for multiple
        // instances of the same module
        let stylesHasBeenCached = memoryCache.get(ModuleCachePrefix + moduleData.template);

        // If the stylesheet has been cached, do not cache it again
        if (!stylesHasBeenCached) this._shimCssRules(moduleData);

        // Transpile ES6 script files to ES5 and store in cache directory for quick retrieval
        this._compileJsFiles(moduleData);

        // Assign unique identifier attributes to the HTMl elements of the current module and return it
        // after compiled to HTML to be rendered on the page
        let compiledTemplate = this._shimHtmlElements(moduleData, config.isSection);

        // The order is important to avoid multiple shimming of the same module template
        memoryCache.put(ModuleCachePrefix + moduleData.template, this._moduleComponentId);

        return compiledTemplate;
    }
}
