const socket = require('socket.io-client')

const socketDomainMeta = document.querySelector('[name="mt-socket-domain"]')
const socketDomain = socketDomainMeta.getAttribute('content')

const cookies = document.cookie.split(' ')

let sessionId = 'untracked'

cookies.forEach(_cookie => {

	const [key, value] = _cookie.split('=')

	if (key === 'connect.sid') sessionId = value
})


const getCurrentPathname = () => {

	let pathname = window.location.pathname

	pathname = pathname.replace(/^\/+|\/+$/g, '')

	if (pathname === '') pathname = 'home'

	return pathname
}

const getDeviceType = () => {

	let deviceType = 'desktop'

	if (window.matchMedia("(max-width: 480px)").matches) {

		deviceType = 'mobile'

	} else if (window.matchMedia("(max-width: 960px)").matches) {

		deviceType = 'tablet'
	}

	return deviceType
}

const getOptions = () => {

	return {

		query: {
			client_type: 'client',
			session_id: sessionId,
			current_page: getCurrentPathname(),
			device_type: getDeviceType(),
		}
	}
}

let socketClient = socket.connect(socketDomain, getOptions())

window.addEventListener('focus', () => {

	socketClient.emit('update:meta', {current_page: getCurrentPathname(), device_type: getDeviceType()})
})

/*
 socketClient.on('connect', () => {

 console.log('Connection established')
 })

 socketClient.on('disconnect', () => {

 console.log('Disconnected')
 })
 */
