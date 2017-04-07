import * as fs from 'fs'
import * as css from 'css'
import * as ejs from 'ejs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import * as cheerio from 'cheerio'
import * as uglify from 'uglifyify'
import * as babelify from 'babelify'
import * as nodeSass from 'node-sass'
import * as browserify from 'browserify'
import * as redis from 'redis'
import {CachePath, ViewsPath} from "../@stellium-common/path/common_paths"
import ReadWriteStream = NodeJS.ReadWriteStream


const redisClient = redis.createClient()


redisClient.get()





export const GenerateModuleTemplates = (templateKey: string) => {

    const [group, template] = templateKey.split('/')
}


export interface ModuleCompilerConfig {
    unique?: boolean
    isSection?: boolean
}


const moduleCacheKeyStorage = []


const getModuleCacheKey = (templateKey: string) => {

    const key = GenerateModuleTemplates(templateKey)
}


const storeModuleCacheKey = (templateKey: string, cacheKey: string) => {

    const moduleKey = GenerateModuleTemplates(templateKey)

    moduleCacheKeyStorage.push({
        moduleKey,
        cacheKey
    })
}


let _moduleIndex: number = 0

let _moduleOrder: number = 0

let _moduleComponentId: string


export const ModuleCachePrefix = 'template_cache_id_'


const _shimCssRules = (moduleData: any): void => {

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

                let pseudoDelimited = _rule.split(':');

                return pseudoDelimited.join(`[${this._moduleComponentId}]:`);
            }
            return `${_rule}[${this._moduleComponentId}]`;
        });
    });

// Convert CSS AST to string
    let shimmedCssString = css.stringify(astCss);

// Assert that the directory to the components css exists
    mkdirp.sync(path.resolve(CachePath, 'css', moduleData.template));

    fs.writeFileSync(
        path.resolve(CachePath, 'css', moduleData.template, 'component.css'),
        shimmedCssString,
        {encoding: 'UTF-8'}
    );
}


const _createUniqueModuleIdentifier = (length: number): string => {

    let identifier = '';
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    let charLength = chars.length;

    for (let i = 0; i < length; i++) {
        identifier += chars.charAt(Math.floor(Math.random() * charLength));
    }

    return identifier;
}


const _compileJsFiles = (moduleData: any): void => {

    let scriptPath = path.resolve(ViewsPath, 'modules', moduleData.template, 'component.js');

    try {
        fs.accessSync(scriptPath)
    } catch (e) {
        return
    }

    mkdirp.sync(path.resolve(CachePath, 'js', moduleData.template))

    browserify(scriptPath)
    .transform(babelify, {presets: ["es2015"]})
    .transform(<(file: string, opts?: any) => ReadWriteStream>uglify)
    .bundle()
    .pipe(fs.createWriteStream(path.resolve(CachePath, 'js', moduleData.template, 'component.js')))
}


const _shimHtmlElements = (moduleData: any, isSection: boolean): string => {

    let modulePath = path.resolve(ViewsPath, 'modules', moduleData.template, 'component.ejs');

    let cachedComponentId = memoryCache.get(ModuleCachePrefix + moduleData.template);

    if (cachedComponentId) this._moduleComponentId = cachedComponentId;

    // bind template globals to the injected data to be rendered
    let templateData = {
        module: moduleData,
        locals: this,
        moduleId: this._moduleIndex
    }

    // EJS file read to string
    let ejsString = fs.readFileSync(modulePath, 'utf8');

    // EJS compiled to HTML
    let renderedTemplate = ejs.render(ejsString, templateData);

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
    moduleElement.prepend(`<span class="anchor-target" id="anchor-id-${this._moduleIndex}"></span>`);

    // Set module template name
    moduleElement.attr('mt-stellium-module-template', moduleData.template);

    if (isSection) {
        // Assign stellium class for click handling in page editor
        moduleElement.addClass('mt-stellium-module');

        // Assign stellium module order number for Stellium medium sorting
        moduleElement.attr('mt-stellium-module-order', ++this._moduleOrder);

        // Assign stellium module order number for Stellium medium sorting
        moduleElement.addClass('mt-stellium-module-order');
    }

    allElements.attr(this._moduleComponentId, '');

    // Return the manipulated HTML Element as string
    return `<!-- module-start:${moduleData.template} -->
                              ${$.html()}
                <!-- module-end:${moduleData.template} -->`;
}


/**
 *
 * @param moduleData
 * @param config - true if every stylesheet and script files should be shimmed individually,
 *                 false if the module can share template, styles and scripts
 * @returns {string}
 */
const moduleCompiler = (moduleData: any, config: ModuleCompilerConfig = {}): string => {


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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////