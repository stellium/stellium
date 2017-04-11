const MediumEditor = require('medium-editor')
const MediumEditorList = require('medium-editor-list')

const moduleOrderSelector = 'mt-stellium-module-order'

const baseDomain = document.querySelector('base').getAttribute('href')

function messageTransporter(type, moduleIndex, bindingPath, content = null, clientRect = null) {

	clientRect = {
		bottom: clientRect && clientRect.bottom,
		height: clientRect && clientRect.height,
		left: clientRect && clientRect.left,
		right: clientRect && clientRect.right,
		top: clientRect && clientRect.top,
		width: clientRect && clientRect.width,
	}

	moduleIndex = parseInt(moduleIndex)

	parent.postMessage({
		type,
		moduleIndex,
		bindingPath,
		content,
		clientRect
	}, baseDomain)
}

function bindMediumEditorElements() {

	const bindingSelector = 'mt-medium-binding'

	const mediumElements = document.querySelectorAll(`[${bindingSelector}]`)

	mediumElements.forEach(function (_mediumElement) {

		let options = _mediumElement.getAttribute('mt-medium-options')

		options = options ? 'full' : options

		const baseMediumOptions = {
			toolbar: {
				buttons: [
					'bold',
					'italic',
					'underline',
				]
			},
			extensions: {},
			placeholder: 'Insert text...'
		}

		if (options === 'full') {

			// Additional options for non basic inputs
			// this should normally only be used in complex text
			// content such as descriptive paragraphs
			// but not in section titles and headers
			baseMediumOptions.toolbar.buttons = [].concat(baseMediumOptions.toolbar.buttons, ['h1', 'h2', 'h3', 'list-extension'])

			// Adds the list editing option to create ordered and unordered lists
			baseMediumOptions.extensions['list-extension'] = new MediumEditorList()
		}

		const _mediumEditor = new MediumEditor(_mediumElement, baseMediumOptions)

		_mediumEditor.subscribe('blur', () => {

			messageTransporter(
				'medium',
				_mediumElement.getAttribute(moduleOrderSelector),
				_mediumElement.getAttribute(bindingSelector),
				_mediumElement.innerHTML
			)
		})
	})
}


function bindInputEditorElements() {

	const bindingSelector = 'mt-input-binding'

	const inputElements = document.querySelectorAll(`[${bindingSelector}]`)

	inputElements.forEach(_inputElement => {

		_inputElement.setAttribute('contenteditable', 'true')

		_inputElement.addEventListener('blur', () => {

			messageTransporter(
				'medium',
				_inputElement.getAttribute(moduleOrderSelector),
				_inputElement.getAttribute(bindingSelector),
				_inputElement.innerHTML
			)
		})
	})
}


function bindImagePickerElements() {

	const bindingSelector = 'mt-image-binding'

	const inputElements = document.querySelectorAll(`[${bindingSelector}]`)

	inputElements.forEach(_element => {

		_element.addEventListener('click', (e) => {

			e.preventDefault()

			messageTransporter(
				'image',
				_element.getAttribute(moduleOrderSelector),
				_element.getAttribute(bindingSelector)
			)
		})
	})
}


function bindLinkEditorElements() {

	const bindingSelector = 'mt-link-binding'

	const linkElements = document.querySelectorAll(`[${bindingSelector}]`)

	linkElements.forEach(_linkElement => {

		_linkElement.addEventListener('click', (e) => {

			e.preventDefault()

			messageTransporter(
				'link',
				_linkElement.getAttribute(moduleOrderSelector),
				_linkElement.getAttribute(bindingSelector),
				null,
				e.target.getBoundingClientRect()
			)
		})
	})
}

(function() {

	bindMediumEditorElements()

	bindInputEditorElements()

	bindImagePickerElements()

	bindLinkEditorElements()
})();