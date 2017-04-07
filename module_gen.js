const pages = require('./seeders/pages.json')
const mkdirp = require('mkdirp')
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')


rimraf.sync(path.resolve('.', 'z_modules'))

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

let templateMap = [];

// import {TextRowsModuleEditorComponent} from "./text/rows/text_rows.component";
let templateImports = [];


let modules = []

let ngComponentNames = []

pages.forEach(_page => {

    _page.modules.forEach(_module => {
        if (!modules.includes(_module.template)) modules.push(_module.template)
    })
})

modules.forEach(_module => {

    let [group, template] = _module.split('/')

    let groupPath = path.resolve('.', 'z_modules', group)

    let templatePath = path.resolve(groupPath, template)

    mkdirp.sync(groupPath)

    mkdirp.sync(templatePath)

    let componentName = template + '.component'

    const extensions = ['ts', 'html']

    let templateChunks = template.split('-')

    templateChunks = templateChunks.map(_chunk => capitalizeFirstLetter(_chunk))

    let ngComponentName = `${capitalizeFirstLetter(group)}${templateChunks.join('')}ModuleEditorComponent`

    const stubs = {
        ts: `import {Component} from "@angular/core";
import {BaseModuleEditorComponent} from "../../../base.component";
import {StoreService} from "../../../../../../../../services/store/store.service";
import {FilePickerPanelService} from "../../../../../../../../components/file-picker/file-picker.service";


@Component({
    selector: 'mt-editor-${group}-${template}',
    templateUrl: '${group}-${componentName}.html',
    styleUrls: ['../../../base.component.scss'],
})
export class ${ngComponentName} extends BaseModuleEditorComponent {


    constructor(storeService: StoreService, filePickerPanelService: FilePickerPanelService) {
        super(storeService, filePickerPanelService)
    }
}`,
        html: `<h1>Editing: ${capitalizeFirstLetter(group)} - ${templateChunks.join(' ')}</h1>

<div class="mt-module-editor--scrollable-view" fxFlex>
    <!-- Module Form -->
</div>

<div class="mt-module-editor--action-wrapper">
    <button class="mt-button mt-warn" (click)="close()">
        <span>Cancel</span>
    </button>
    <button mt-button (click)="saveModuleUpdate(module)">
        <span>Save</span>
    </button>
</div>

`
    }

    templateMap.push({
        template: _module,
        component: ngComponentName
    })

    templateImports.push(`import {${ngComponentName}} from './${group}/${template}/${group}-${componentName}'`)

    ngComponentNames.push(ngComponentName)

    // import {TextRowsModuleEditorComponent} from "./text/rows/text_rows.component";

    extensions.forEach(ext => fs.writeFileSync(path.resolve(templatePath, group + '-' + componentName + '.' + ext), stubs[ext]))
})

let componentMapText = templateImports.join('\n') + '\n\n\nexport const componentMap = [\n' + ngComponentNames.join(',\n') + '\n]\n';

let templateMapText = templateImports.join('\n') + '\n\n\nexport const moduleTemplateMap =' + JSON.stringify(templateMap, null, 4) + '\n\nexport const moduleTemplates = () => moduleTemplateMap.map(_map => _map.component)'

templateMapText = templateMapText.replace(/"/g, "'")

templateMapText = templateMapText.replace(/'component':/g, "component:")
templateMapText = templateMapText.replace(/'template':/g, "template:")

fs.writeFileSync(path.resolve('.', 'z_modules', 'template-map.ts'), templateMapText)
fs.writeFileSync(path.resolve('.', 'z_modules', 'component-map.ts'), componentMapText)

console.log(modules.sort());
