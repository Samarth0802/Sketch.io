const title = document.querySelector('#projectName')
const closeBtn = document.querySelector('.close-btn')
const leftSide = document.querySelector('.left-side')
const openBtn = document.querySelector('.open-btn')
const middlePart = document.querySelector('.middle-part')
const pageColor = document.querySelector('.pageColor')
const pageOpacity = document.querySelector('.pageOpacity')
const colorBox = document.querySelector('#pageColorBox')
const saveBtn = document.querySelector('#saveBtn')
const layerList = document.querySelector('.layer-list')
const canvas = document.querySelector('#canvas')
const rectangleTool = document.querySelector('.rectangle')
const textTool = document.querySelector('.text-box')
const exportJSONBtn = document.querySelector('#exportJSON')
const exportHTMLBtn = document.querySelector('#exportHTML')

const elementProps = document.querySelector('#elementProps')
const elemWidth = document.querySelector('#elem-width')
const elemHeight = document.querySelector('#elem-height')
const elemBgColor = document.querySelector('#elem-bg-color')
const elemTextColor = document.querySelector('#elem-text-color')
const elemRotation = document.querySelector('#elem-rotation')
const textColorRow = document.querySelector('#textColorRow')

let elements = []
let selectedElement = null
let currentTool = 'rectangle'
let elementIdCounter = 1
let isDragging = false
let isResizing = false
let dragStartX = 0
let dragStartY = 0
let resizeHandle = null

function init() {
  loadStorage()
  setupEvents()
  loadElements()
}

function loadStorage() {
  title.value = localStorage.getItem('titleName') || 'Untitled'
  pageColor.value = localStorage.getItem('pagecolor') || '000000'
  pageOpacity.value = localStorage.getItem('pageopacity') || '100'
  
  const savedElements = localStorage.getItem('elements')
  if (savedElements) {
    elements = JSON.parse(savedElements)
    elementIdCounter = elements.length > 0 ? Math.max(...elements.map(e => parseInt(e.id.replace('elem-', '')))) + 1 : 0
  }
  
  updateMiddleBackground()
}

function saveStorage() {
  localStorage.setItem('titleName', title.value)
  localStorage.setItem('pagecolor', pageColor.value)
  localStorage.setItem('pageopacity', pageOpacity.value)
  localStorage.setItem('elements', JSON.stringify(elements))
  
  alert('Project saved successfully!')
}

function updateMiddleBackground() {
  const color = pageColor.value || '000000'
  const opacity = (pageOpacity.value || 100) / 100
  
  const r = parseInt(color.slice(0, 2), 16)
  const g = parseInt(color.slice(2, 4), 16)
  const b = parseInt(color.slice(4, 6), 16)
  
  middlePart.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`
  colorBox.style.backgroundColor = `#${color}`
}

function createElement(type, x = 100, y = 100) {
  const id = `elem-${elementIdCounter++}`
  const element = {
    id: id,
    type: type,
    x: x,
    y: y,
    width: type === 'text' ? 150 : 120,
    height: type === 'text' ? 50 : 120,
    backgroundColor: type === 'text' ? 'transparent' : 'F5DEB3',
    textColor: 'FFFFFF',
    text: type === 'text' ? 'Double click to edit' : '',
    rotation: 0,
    zIndex: elements.length
  }
  
  elements.push(element)
  renderElement(element)
  updateLayersList()
  selectElement(id)
  
  return element
}

function renderElement(element) {
  const existing = document.getElementById(element.id)
  if (existing) {
    existing.remove()
  }
  
  const div = document.createElement('div')
  div.id = element.id
  div.className = `canvas-element ${element.type}`
  div.style.left = `${element.x}px`
  div.style.top = `${element.y}px`
  div.style.width = `${element.width}px`
  div.style.height = `${element.height}px`
  div.style.zIndex = element.zIndex
  div.style.transform = `rotate(${element.rotation}deg)`
  
  if (element.type === 'rectangle') {
    div.style.backgroundColor = `#${element.backgroundColor}`
  } else if (element.type === 'text') {
    div.textContent = element.text
    div.contentEditable = false
    div.style.backgroundColor = `#${element.backgroundColor}`
    div.style.color = `#${element.textColor || 'FFFFFF'}`
  }
  
  div.addEventListener('mousedown', handleElementMouseDown)
  div.addEventListener('dblclick', handleElementDoubleClick)
  
  canvas.appendChild(div)
}

function loadElements() {
  canvas.querySelectorAll('.canvas-element').forEach(el => el.remove())
  elements.forEach(element => renderElement(element))
  updateLayersList()
}

function selectElement(elementId) {
  if (selectedElement) {
    const prevEl = document.getElementById(selectedElement)
    if (prevEl) {
      prevEl.classList.remove('selected')
      removeResizeHandles()
    }
  }
  
  selectedElement = elementId
  
  if (elementId) {
    const el = document.getElementById(elementId)
    if (el) {
      el.classList.add('selected')
      addResizeHandles(el)
      updatePropertiesPanel()
    }
  } else {
    elementProps.style.display = 'none'
  }
  
  updateLayersList()
}

function deselectElement() {
  selectElement(null)
}

function addResizeHandles(element) {
  removeResizeHandles()
  
  const positions = ['tl', 'tr', 'bl', 'br']
  positions.forEach(pos => {
    const handle = document.createElement('div')
    handle.className = `resize-handle ${pos}`
    handle.dataset.position = pos
    handle.addEventListener('mousedown', handleResizeStart)
    element.appendChild(handle)
  })
}

function removeResizeHandles() {
  document.querySelectorAll('.resize-handle').forEach(handle => handle.remove())
}

function updatePropertiesPanel() {
  if (!selectedElement) {
    elementProps.style.display = 'none'
    return
  }
  
  const element = elements.find(e => e.id === selectedElement)
  if (!element) return
  
  elementProps.style.display = 'flex'
  elemWidth.value = element.width
  elemHeight.value = element.height
  elemBgColor.value = element.backgroundColor
  elemRotation.value = element.rotation
  
  if (element.type === 'text') {
    textColorRow.style.display = 'flex'
    elemTextColor.value = element.textColor || 'FFFFFF'
  } else {
    textColorRow.style.display = 'none'
  }
}

function updateLayersList() {
  if (elements.length === 0) {
    layerList.innerHTML = '<p class="empty-state">No layers yet</p>'
    return
  }
  
  layerList.innerHTML = ''
  
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex)
  
  sortedElements.forEach(element => {
    const layerItem = document.createElement('div')
    layerItem.className = 'layer-item'
    if (selectedElement === element.id) {
      layerItem.classList.add('selected')
    }
    
    const iconClass = element.type === 'rectangle' ? 'ri-rectangle-line' : 'ri-text'
    
    layerItem.innerHTML = `
      <div class="layer-name">
        <i class="${iconClass}"></i>
        <span>${element.type === 'rectangle' ? 'Rectangle' : 'Text'} ${element.id.split('-')[1]}</span>
      </div>
      <div class="layer-actions">
        <i class="ri-arrow-up-s-line" data-action="up" data-id="${element.id}"></i>
        <i class="ri-arrow-down-s-line" data-action="down" data-id="${element.id}"></i>
      </div>
    `
    
    layerItem.addEventListener('click', (e) => {
      if (!e.target.closest('.layer-actions')) {
        selectElement(element.id)
      }
    })
    
    const upBtn = layerItem.querySelector('[data-action="up"]')
    const downBtn = layerItem.querySelector('[data-action="down"]')
    
    upBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      moveLayerUp(element.id)
    })
    
    downBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      moveLayerDown(element.id)
    })
    
    layerList.appendChild(layerItem)
  })
}

function moveLayerUp(elementId) {
  const element = elements.find(e => e.id === elementId)
  if (!element) return
  
  const maxZ = Math.max(...elements.map(e => e.zIndex))
  if (element.zIndex < maxZ) {
    const swapElement = elements.find(e => e.zIndex === element.zIndex + 1)
    if (swapElement) {
      swapElement.zIndex--
      element.zIndex++
      loadElements()
    }
  }
}

function moveLayerDown(elementId) {
  const element = elements.find(e => e.id === elementId)
  if (!element) return
  
  if (element.zIndex > 0) {
    const swapElement = elements.find(e => e.zIndex === element.zIndex - 1)
    if (swapElement) {
      swapElement.zIndex++
      element.zIndex--
      loadElements()
    }
  }
}

function handleElementMouseDown(e) {
  if (e.target.classList.contains('resize-handle')) return
  
  e.stopPropagation()
  selectElement(e.currentTarget.id)
  
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  
  const element = elements.find(el => el.id === e.currentTarget.id)
  if (element) {
    dragStartX = e.clientX - element.x
    dragStartY = e.clientY - element.y
  }
}

function handleElementDoubleClick(e) {
  const element = elements.find(el => el.id === e.currentTarget.id)
  if (element && element.type === 'text') {
    e.currentTarget.contentEditable = true
    e.currentTarget.focus()
    
    e.currentTarget.addEventListener('blur', function handler() {
      this.contentEditable = false
      element.text = this.textContent
      this.removeEventListener('blur', handler)
    })
  }
}

function handleResizeStart(e) {
  e.stopPropagation()
  isResizing = true
  resizeHandle = e.target.dataset.position
  dragStartX = e.clientX
  dragStartY = e.clientY
}

function handleMouseMove(e) {
  if (isDragging && selectedElement) {
    const element = elements.find(el => el.id === selectedElement)
    if (!element) return
    
    const canvasRect = canvas.getBoundingClientRect()
    let newX = e.clientX - dragStartX
    let newY = e.clientY - dragStartY
    
    newX = Math.max(0, Math.min(newX, canvasRect.width - element.width))
    newY = Math.max(0, Math.min(newY, canvasRect.height - element.height))
    
    element.x = newX
    element.y = newY
    
    const el = document.getElementById(element.id)
    if (el) {
      el.style.left = `${newX}px`
      el.style.top = `${newY}px`
    }
    
    updatePropertiesPanel()
  }
  
  if (isResizing && selectedElement && resizeHandle) {
    const element = elements.find(el => el.id === selectedElement)
    if (!element) return
    
    const deltaX = e.clientX - dragStartX
    const deltaY = e.clientY - dragStartY
    
    const el = document.getElementById(element.id)
    
    if (resizeHandle === 'br') {
      element.width = Math.max(20, element.width + deltaX)
      element.height = Math.max(20, element.height + deltaY)
    } else if (resizeHandle === 'bl') {
      const newWidth = Math.max(20, element.width - deltaX)
      const widthDiff = element.width - newWidth
      element.width = newWidth
      element.x += widthDiff
      element.height = Math.max(20, element.height + deltaY)
    } else if (resizeHandle === 'tr') {
      element.width = Math.max(20, element.width + deltaX)
      const newHeight = Math.max(20, element.height - deltaY)
      const heightDiff = element.height - newHeight
      element.height = newHeight
      element.y += heightDiff
    } else if (resizeHandle === 'tl') {
      const newWidth = Math.max(20, element.width - deltaX)
      const newHeight = Math.max(20, element.height - deltaY)
      const widthDiff = element.width - newWidth
      const heightDiff = element.height - newHeight
      element.width = newWidth
      element.height = newHeight
      element.x += widthDiff
      element.y += heightDiff
    }
    
    if (el) {
      el.style.width = `${element.width}px`
      el.style.height = `${element.height}px`
      el.style.left = `${element.x}px`
      el.style.top = `${element.y}px`
    }
    
    dragStartX = e.clientX
    dragStartY = e.clientY
    
    removeResizeHandles()
    addResizeHandles(el)
    updatePropertiesPanel()
  }
}

function handleMouseUp() {
  isDragging = false
  isResizing = false
  resizeHandle = null
}

function handleCanvasClick(e) {
  if (e.target === canvas) {
    if (currentTool && !isDragging) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      createElement(currentTool, x, y)
    } else {
      deselectElement()
    }
  }
}

function handleKeyDown(e) {
  if (!selectedElement) return
  
  const element = elements.find(el => el.id === selectedElement)
  if (!element) return
  
  if (e.target.tagName === 'INPUT' || e.target.contentEditable === 'true') return
  
  const canvasRect = canvas.getBoundingClientRect()
  
  switch(e.key) {
    case 'Delete':
    case 'Backspace':
      deleteElement(selectedElement)
      e.preventDefault()
      break
    case 'ArrowUp':
      element.y = Math.max(0, element.y - 5)
      break
    case 'ArrowDown':
      element.y = Math.min(canvasRect.height - element.height, element.y + 5)
      break
    case 'ArrowLeft':
      element.x = Math.max(0, element.x - 5)
      break
    case 'ArrowRight':
      element.x = Math.min(canvasRect.width - element.width, element.x + 5)
      break
    default:
      return
  }
  
  const el = document.getElementById(element.id)
  if (el) {
    el.style.left = `${element.x}px`
    el.style.top = `${element.y}px`
  }
  
  updatePropertiesPanel()
  e.preventDefault()
}

function deleteElement(elementId) {
  elements = elements.filter(e => e.id !== elementId)
  const el = document.getElementById(elementId)
  if (el) el.remove()
  deselectElement()
  updateLayersList()
}

function handlePropertyChange(e) {
  if (!selectedElement) return
  
  const element = elements.find(el => el.id === selectedElement)
  if (!element) return
  
  const el = document.getElementById(element.id)
  if (!el) return
  
  switch(e.target.id) {
    case 'elem-width':
      element.width = Math.max(20, parseInt(e.target.value) || 20)
      el.style.width = `${element.width}px`
      removeResizeHandles()
      addResizeHandles(el)
      break
    case 'elem-height':
      element.height = Math.max(20, parseInt(e.target.value) || 20)
      el.style.height = `${element.height}px`
      removeResizeHandles()
      addResizeHandles(el)
      break
    case 'elem-bg-color':
      element.backgroundColor = e.target.value.replace('#', '')
      el.style.backgroundColor = `#${element.backgroundColor}`
      break
    case 'elem-text-color':
      element.textColor = e.target.value.replace('#', '')
      if (element.type === 'text') {
        el.style.color = `#${element.textColor}`
      }
      break
    case 'elem-rotation':
      element.rotation = parseInt(e.target.value) || 0
      el.style.transform = `rotate(${element.rotation}deg)`
      break
  }
}

function exportToJSON() {
  const data = {
    projectName: title.value,
    pageColor: pageColor.value,
    pageOpacity: pageOpacity.value,
    elements: elements
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.value || 'design'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function exportToHTML() {
  const color = pageColor.value || '000000'
  const opacity = (pageOpacity.value || 100) / 100
  const r = parseInt(color.slice(0, 2), 16)
  const g = parseInt(color.slice(2, 4), 16)
  const b = parseInt(color.slice(4, 6), 16)
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title.value || 'Design Export'}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: rgba(${r}, ${g}, ${b}, ${opacity});
            position: relative;
            min-height: 100vh;
        }
        .element {
            position: absolute;
        }
    </style>
</head>
<body>
`
  
  elements.forEach(element => {
    const styles = `left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; z-index: ${element.zIndex}; transform: rotate(${element.rotation}deg);`
    
    if (element.type === 'rectangle') {
      html += `    <div class="element" style="${styles} background-color: #${element.backgroundColor};"></div>
`
    } else if (element.type === 'text') {
      html += `    <div class="element" style="${styles} background-color: #${element.backgroundColor}; color: #${element.textColor || 'FFFFFF'}; display: flex; align-items: center; justify-content: center; font-size: 16px; padding: 8px;">${element.text}</div>
`
    }
  })
  
  html += `</body>
</html>`
  
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.value || 'design'}.html`
  a.click()
  URL.revokeObjectURL(url)
}

function setupEvents() {
  pageColor.addEventListener('input', updateMiddleBackground)
  pageOpacity.addEventListener('input', updateMiddleBackground)
  saveBtn.addEventListener('click', saveStorage)
  
  closeBtn.addEventListener('click', () => {
    leftSide.style.transform = 'translateX(-100%)'
    leftSide.style.display = 'none'
    openBtn.style.opacity = 1
    openBtn.style.display = 'block'
  })
  
  openBtn.addEventListener('click', () => {
    leftSide.style.display = 'flex'
    leftSide.style.transform = 'translateX(0%)'
    openBtn.style.opacity = 0
    openBtn.style.display = 'none'
  })
  
  rectangleTool.addEventListener('click', () => {
    currentTool = 'rectangle'
    rectangleTool.classList.add('active')
    textTool.classList.remove('active')
  })
  
  textTool.addEventListener('click', () => {
    currentTool = 'text'
    textTool.classList.add('active')
    rectangleTool.classList.remove('active')
  })
  
  canvas.addEventListener('click', handleCanvasClick)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('keydown', handleKeyDown)
  
  elemWidth.addEventListener('input', handlePropertyChange)
  elemHeight.addEventListener('input', handlePropertyChange)
  elemBgColor.addEventListener('input', handlePropertyChange)
  elemTextColor.addEventListener('input', handlePropertyChange)
  elemRotation.addEventListener('input', handlePropertyChange)
  
  exportJSONBtn.addEventListener('click', exportToJSON)
  exportHTMLBtn.addEventListener('click', exportToHTML)
}

init()