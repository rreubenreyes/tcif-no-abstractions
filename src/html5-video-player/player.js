/* eslint-disable no-use-before-define */
/* player elements */
const player = document.querySelector('.player')
const viewer = player.querySelector('.viewer')
const [playButton, ...skipButtons] = player.querySelectorAll('button')
const progressBar = player.querySelector('.progress')
const progress = player.querySelector('.progress__filled')
const volumeSlider = player.querySelector('[name="volume"]')
const playbackSlider = player.querySelector('[name="playbackRate"]')

/* inspector */
const inspector = {
  currentItem: document.querySelector('.inspector__current-item'),
  log: [],
  target: document.querySelector('.inspector__window'),
  clearButton: document.querySelector('.inspector__button--clear'),
  modeButton: document.querySelector('.inspector__button--inspector'),
  inspecting: '',
  inspectorMode: false,
  clearInspectedItem() {
    this.target.innerHTML = ''
    this.inspect('')
  },
  colorize(string, payload = null) {
    if (!payload) return string
    const colorized = string.replace(
      payload.regex,
      `<span style="color: ${payload.color};">${payload.name}</span>`,
    )
    return colorized
  },
  inspect(item) {
    this.inspecting = item === '' ? item : item.name
    this.currentItem.innerHTML = item === '' ? '[All]' : item.name
    this.refresh()
  },
  refresh() {
    this.target.innerHTML = ''
    this.log.forEach((line) => {
      if (line.string.includes(this.inspecting)) {
        this.target.innerHTML += `${line.string}<br>`
      }
    })
    this.target.scrollTop = this.target.scrollHeight - this.target.offsetHeight
  },
  write(string, payload = null) {
    this.target.innerHTML = ''
    this.log.push({ name: payload.name, string: this.colorize(string, payload) })
    this.refresh()
  },
}

/* assign handlers */
function handleInspectorModeToggle() {
  this.classList.toggle('off')
  inspector.inspecting = ''
  inspector.inspectorMode = !inspector.inspectorMode
}
function handlePlayPause() {
  if (inspector.inspectorMode) {
    inspector.inspect(PL_VIEWER)
    return
  }
  const method = viewer.paused ? 'play' : 'pause'
  viewer[method]()
  this.innerHTML = viewer.paused ? '►' : 'II'
  inspector.write(`viewer.${method}()`, PL_VIEWER)
}
function handleProgressChange() {
  progress.style.flexBasis = `${(viewer.currentTime / viewer.duration) * 100}%`
}
function handleSkip() {
  viewer.currentTime += parseFloat(this.dataset.skip)
  inspector.write(`viewer.currentTime += ${this.dataset.skip}`, PL_VIEWER)
  inspector.write(
    `progressBar.style.flexBasis = "${(viewer.currentTime / viewer.duration) * 100}%"`,
    PL_PROGRESS,
  )
  handleProgressChange()
}
function handleScrub(e) {
  const percent = e.offsetX / this.offsetWidth
  progress.style.flexBasis = `${percent * 100}%`
  viewer.currentTime = parseFloat(percent) * viewer.duration
}

/* constants */
const PL_VIEWER = { name: 'viewer', regex: /viewer/gi, color: 'var(--solid-blue)' }
const PL_PROGRESS = { name: 'progressBar', regex: /progressBar/gi, color: 'var(--solid-green)' }

/* state variables */
let canScrub = false

/* RENDER */
inspector.target.style.flexBasis = `${player.offsetHeight}px`
inspector.inspect('')

/* listeners */
/* buttons */
viewer.addEventListener('click', handlePlayPause.bind(playButton))
playButton.addEventListener('click', handlePlayPause)
skipButtons.forEach((button) => {
  button.addEventListener('click', handleSkip)
})

/* sliders */
playbackSlider.addEventListener('input', (e) => {
  viewer.playbackRate = e.target.value
  inspector.write(`viewer.playbackRate = ${viewer.playbackRate}`, PL_VIEWER)
})
volumeSlider.addEventListener('input', (e) => {
  viewer.volume = e.target.value
  inspector.write(`viewer.volume = ${viewer.volume}`, PL_VIEWER)
})

/* progress bar */
viewer.addEventListener('timeupdate', handleProgressChange)
progressBar.addEventListener('mousedown', () => {
  if (inspector.inspectorMode) inspector.inspect(PL_PROGRESS)
  canScrub = true
})
progressBar.addEventListener('mousemove', (e) => {
  if (canScrub) handleScrub.call(progressBar, e)
})
progressBar.addEventListener('mouseup', (e) => {
  handleScrub.call(progressBar, e)
  inspector.write(`viewer.currentTime = ${viewer.currentTime}s`, PL_VIEWER)
  inspector.write(
    `progressBar.style.flexBasis = "${(viewer.currentTime / viewer.duration) * 100}%"`,
    PL_PROGRESS,
  )
  canScrub = false
})

/* inspector */
inspector.modeButton.addEventListener('click', handleInspectorModeToggle)
inspector.clearButton.addEventListener('click', () => {
  inspector.clearInspectedItem()
})
