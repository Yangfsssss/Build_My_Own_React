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
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  }
}
console.log(createElement('b'))
console.log(createElement('a', null, 'bar'))

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

const element = Didact.createElement(
  'div',
  { id: 'foo' },
  Didact.createElement('a', null, 'bar'),
  // {type:'a',props:{children:'bar'}},
  Didact.createElement('b')
  // {type:'b',props:{children:[]}}
)
console.log(element)
console.log(container)

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

const isEvent = (key) => key.startWith('on')

const isProperty = (key) => key !== 'children' && !isEvent(key)

const isNew = (prev, next) => (key) => prev[key] !== next[key]

const isGone = (prev, next) => (key) => !(key in next)

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
  commitWork(wipRoot, child)
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
    updateDom(fiber.dom.fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom)
  }

  domParent.appendChild(fiber.dom)
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
  nextUnitWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

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

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
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
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
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
    const sameType = oldFiber && element && element.type == oldFiber.type

    if (sameType) {
      //TODO update the node
    }

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

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name]
    })

  return dom
}
