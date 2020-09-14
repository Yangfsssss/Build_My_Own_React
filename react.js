//React
// const element = <h1 tltle='foo'>Hello</h1>
// const container = document.getElementById('root')
// ReactDOM.render(element,container)



//Step0 Vanilla JS
// const element = {
//     type:'h1',
//     props:{
//         title:'foo',
//         children:'Hello',
//     }
// }

// const container = document.getElementById('root')
// const node = document.createElement(element.type)
// node['title'] = element.props.title

// const text = document.createTextNode('')
// text['nodeValue'] = element.props.children

// node.appendChild(text)
// container.appendChild(node)



//Step1 The createElement Function
//React
// const elementJ = (
// 	<div id='foo'>
// 		<a>bar</a>
// 		<b />
// 	</div>
// )

// const elementO = {
// 	type: 'div',
// 	props: {
// 		id: "foo",
// 		children: [
// 			{
// 				type: 'a',
// 				props: {
// 					children: 'bar'
// 				}
// 			},
// 			{
// 				type: 'b'
// 			},
// 		]
// 	},
// }

// const element = React.createElement('div',{id:'foo'},React.createElement('a',null,'bar'))

const container = document.getElementById('root')
// ReactDOM.render(element,container)
function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map(child =>
				typeof child === 'object'
					? child
					: createTextElement(child)
			)
		},
	}
}
console.log(createElement('b'));
console.log(createElement('a', null, 'bar'));

function createTextElement(text) {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: [],
		},
	}
}

const Didact = {
	createElement,
	render,
}

const element = Didact.createElement('div', { id: 'foo' },
	Didact.createElement('a', null, 'bar'),
	// {type:'a',props:{children:'bar'}},
	Didact.createElement('b')
	// {type:'b',props:{children:[]}}
)
console.log(element);
console.log(container);



//Step2 The render Function
// function render(element, container) {
// 	const dom = element.type === 'TEXT_ELEMENT'
// 		? document.createTextNode('')
// 		: document.createElement(element.type)

// 	const isProperty = key => key !== 'children'

// 	Object.keys(element.props)
// 		.filter(isProperty)
// 		.forEach(
// 			name => {
// 				dom[name] = element.props[name]
// 			})

// 	console.log(element.props.children);
// 	element.props.children.forEach(child => render(child, dom))

// 	container.appendChild(dom)
// }

// Didact.render(element, container)



//Step3 Concurrent Mode
let nextUnitWork = null

function workLoop(deadline) {
	let shouldYield = false
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
		shouldYield = deadline.timeRemaining() < 1
	}
	requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
	//TODO add dom node
	if (!fiber.dom) {
		fiber.dom = createDom(fiber)
	}

	if (fiber.parent) {
		fiber.parent.dom.appendChild(fiber.dom)
	}
	//TODO create new fibers
	const elements = fiber.props.children
	let index = 0
	let prevSibling = null

	while (index < elements.length) {
		const element = elements[index]

		const newFiber = {
			type: element.type,
			props: element.props,
			parent: fiber,
			dom: null,
		}

		if (index === 0) {
			fiber.child = newFiber
		} else {
			prevSibling.sibling = newFiber
		}

		prevSibling = newFiber
		index++
	}

	//TODO return next unit of work
	if(fiber.child){
		return fiber.child
	}
	let nextFiber = fiber
	while(nextFiber){
		if(nextFiber.sibling){
			return nextFiber.sibling
		}
		nextFiber = nextFiber.parent
	}
}



//Step4 Fibers
function createDom(fiber) {
	const dom = fiber.type === 'TEXT_ELEMENT'
		? document.createTextNode('')
		: document.createElement(fiber.type)

	const isProperty = key => key !== 'children'

	Object.keys(fiber.props)
		.filter(isProperty)
		.forEach(
			name => {
				dom[name] = fiber.props[name]
			})

	return dom
}

function render(element, container) {
	nextUnitWork = {
		dom: container,
		props: {
			children: [element]
		},
	}
}

let nextUnitWork = null






