import * as progress from 'progressbar.js'


const __DEV = !!document.querySelector('[mt-variable-value="__DEV"]')

const StelliumIFrameMode = !!document.querySelector('[mt-variable-value="StelliumIFrameMode"]')

const hotReloadEnabled = !!document.getElementById('mt-hot-progress-bar')


/**
 * TODO(bug): when medium editor content is empty, placeholder label is shown, confusing
 * @date - 4/10/17
 * @time - 1:12 AM
 */


function dispatchWindowEvent(eventName = "load") {

	const load_event = document.createEvent("HTMLEvents")

	load_event.initEvent(eventName, true, true)

	window.dispatchEvent(new Event('load'))

	document.dispatchEvent(new Event('ready'))
}


function triggerHotReload() {

	if (__DEV) console.log("%cHot Content Reloaded", "color:#F06E7B;")

	for (let i = 0; i < HotReloadQueue; i++) {

		let eventId = 'mthotreload' + (i + 1)

		let hotReload = new CustomEvent(eventId, null)

		document.getElementById('mt-hot-progress-bar').dispatchEvent(hotReload)
	}

	dispatchWindowEvent()
}

function updateProgress(progressBar, evt) {

	//noinspection JSUnresolvedVariable
	if (evt.lengthComputable) {

		let percentComplete = (evt.loaded / evt.total) * 100;

		progressBar.animate(percentComplete)
	}
}

function mtHotReload(url) {

	const progressBar = new progress.Line('#mt-hot-progress-bar', {easing: 'easeInOut'})

	progressBar.animate(.33)

	const req = new XMLHttpRequest()

	$('#progressbar').progressbar()

	req.onprogress = (event) => updateProgress(progressBar, event)

	req.open('GET', url + '?hot=true', true)

	req.onreadystatechange = () => {

		if (req.readyState === 4) {

			const hotContainerElement = document.querySelector('[mt-hot-container]')

			const response = JSON.parse(req.responseText)

			progressBar.animate(1, () => {

				progressBar.destroy()

				history.pushState({}, response.title, url)

				document.title = response.title

				const hotContainerElementCopy = hotContainerElement.cloneNode(true)

				hotContainerElementCopy.innerHTML = response.content

				hotContainerElement.parentNode.replaceChild(hotContainerElementCopy, hotContainerElement)

				const nodes = document.querySelectorAll('[stellium-hot-element]')

				for (let i = 0; i < nodes.length; i++) {

					const targetNode = nodes[i]

					const clonedNode = targetNode.cloneNode(true)

					if (clonedNode.tagName.toLowerCase() === 'script') {

						let oldSrc = clonedNode.getAttribute('src');

						if (oldSrc.includes('?')) [oldSrc,] = oldSrc.split('?')

						clonedNode.setAttribute('src', oldSrc + '?cacheBuster=' + Date.now())
					}

					targetNode.parentNode.replaceChild(clonedNode, targetNode)
				}

				// Trigger script reloads
				triggerHotReload()
			})
		}
	}
	req.send()
}


window.addEventListener('popstate', () => {

	const backUrl = location.pathname.replace(/^\/+|\/+$/g, '')

	if (hotReloadEnabled) mtHotReload(backUrl)
})


if (hotReloadEnabled) {

	let templateEventId = 'mthotreload' + ++HotReloadQueue
	document.getElementById('mt-hot-progress-bar').addEventListener(templateEventId, function () {

	}, false)
	
	window.addEventListener('DOMContentLoaded', function () {

		triggerHotReload()

		document.addEventListener('click', function (e) {

			if (e.srcElement.hasAttribute('mt-hot-link') && e.srcElement.hasAttribute('href')) {

				// Only hot reload internal URLs, exclude URLs starting with slash or http
				if (!e.srcElement.getAttribute('href').match(/^\/+|^https?/)) {

					e.preventDefault()

					// disable navigation in iFrame mode
					if (!StelliumIFrameMode) {

						// hot reload page by the link's url
						mtHotReload(e.srcElement.getAttribute('href'))
					}
				}
			}
		})
	})
}

require('./credits')
