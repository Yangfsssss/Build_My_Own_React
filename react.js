let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

const isEvent = (key) => key.startsWith('on')

const isProperty = (key) => key !== 'children' && !isEvent(key)

const isNew = (prev, next) => (key) => prev[key] !== next[key]

const isGone = (prev, next) => (key) => !(key in next)

const container = document.getElementById('root')

requestIdleCallback(workLoop)

function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
		},
	}
}

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

function updateDom(dom, prevProps, nextProps) {
	//Remove old or changed event listeners
	Object.keys(prevProps)
		.filter(isEvent)
		.filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2)
			dom.removeEventListener(eventType, prevProps[name])
		})

	//Remove old properties
	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isGone(prevProps, nextProps))
		.forEach((name) => {
			dom[name] = ''
		})

	//Set new or changed properties
	Object.keys(nextProps)
		.filter(isProperty)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			dom[name] = nextProps[name]
		})

	//Add event listeners
	Object.keys(nextProps)
		.filter(isEvent)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2)
			dom.addEventListener(eventType, nextProps[name])
		})
}

function commitRoot() {
	//TODO add notes to dom
	deletions.forEach(commitWork)
	commitWork(wipRoot.child)
	currentRoot = wipRoot
	wipRoot = null
}

function commitWork(fiber) {
	if (!fiber) {
		return
	}

	const domParent = fiber.parent.dom

	if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
		domParent.appendChild(fiber.dom)
	} else if ((fiber.effectTag = 'UPDATE' && fiber.dom != null)) {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props)
	} else if (fiber.effectTag === 'DELETION') {
		domParent.removeChild(fiber.dom)
	}

	// domParent.appendChild(fiber.dom)
	commitWork(fiber.child)
	commitWork(fiber.sibling)
}

function render(element, container) {
	wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		alternate: currentRoot,
	}
	deletions = []
	nextUnitOfWork = wipRoot
}

function workLoop(deadline) {
	let shouldYield = false
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
		shouldYield = deadline.timeRemaining() < 1
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot()
	}

	requestIdleCallback(workLoop)
}

function performUnitOfWork(wipFiber) {
	//TODO add dom node
	if (!wipFiber.dom) {
		wipFiber.dom = createDom(wipFiber)
	}

	//TODO create new fibers
	const elements = wipFiber.props.children
	reconcileChildren(wipFiber, elements)

	//TODO return next unit of work
	//如果有孩子，返回并处理孩子
	if (wipFiber.child) {
		return wipFiber.child
	}

	let nextFiber = wipFiber
	while (nextFiber) {
		//没有孩子，但有兄弟，返回并处理兄弟
		if (nextFiber.sibling) {
			return nextFiber.sibling
		}
		//既没有孩子，也没有兄弟，就向上寻找父亲的兄弟
		nextFiber = nextFiber.parent
	}
}

function reconcileChildren(wipFiber, elements) {
	let index = 0
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child
	let prevSibling = null

	while (index < elements.length || oldFiber !== null) {
		const element = elements[index]

		let newFiber = null

		//TODO compare oldFiber to element
		const sameType = oldFiber && element && element.type === oldFiber.type

		if (sameType) {
			//TODO update the node
		}

		//若元素与其之前档案中的类型不同，则新建一个fiber
		if (element && !sameType) {
			//TODO add this node
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null,
				effectTag: 'PLACEMENT',
			}
		}

		if (oldFiber && !sameType) {
			//TODO delete the oldFiber's node
			oldFiber.effectTag = 'DELETION'
			deletion.push(oldFiber)
		}

		if (oldFiber) {
			oldFiber = oldFiber.sibling
		}

		if (index === 0) {
			wipFiber.child = newFiber
		} else {
			prevSibling.sibling = newFiber
		}

		prevSibling = newFiber
		index++
	}
}

//Step4 Fibers
function createDom(fiber) {
	const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)

	const isProperty = (key) => key !== 'children'

	// Object.keys(fiber.props)
	// 	.filter(isProperty)
	// 	.forEach((name) => {
	// 		dom[name] = fiber.props[name]
	// 	})

	updateDom(dom, {}, fiber.props)

	return dom
}



//Step5 Render and Commit Phases
//Step6 Reconciliation



//Step7 Function Components
function App(props) {
	return Didact.createElement('h1', null, 'Hi', props.name)
}

const element = Didact.createElement("div", null,
	Didact.createElement(
		'h1', null,
		Didact.createElement('p', null, "I'm p"),
		Didact.createElement('a', null, "I'm a")
	),
	Didact.createElement('h2', null, "I'm h2")
)

console.log(element);

Didact.render(element, container)

