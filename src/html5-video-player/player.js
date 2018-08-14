/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
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
  clearButton: document.querySelector('.inspector__button--clear'),
  currentFocus: null,
  currentFocusName: document.querySelector('.inspector__current-item'),
  inspectorMode: false,
  log: [],
  modeButton: document.querySelector('.inspector__button--inspector'),
  payloads: { initialized: false },
  target: document.querySelector('.inspector__window'),
  wrapper: document.querySelector('.inspector'),
  _mount() {
    this.clearButton.addEventListener('click', this.clearFocus.bind(this))
    this.modeButton.addEventListener('click', this.toggleInspectorMode.bind(this))
    this.setFocus('')
    this._render()
  },
  _render() {
    this.wrapper.style.height = `${player.offsetHeight}px`
  },
  clearFocus() {
    this.target.innerHTML = ''
    this.setFocus(null)
  },
  colorize(string, payload = null) {
    if (!payload) return string
    const colorized = string.replace(
      payload.regex,
      `<span style="color: ${payload.color};">${payload.name}</span>`,
    )
    return colorized
  },
  expose(string, payload = null) {
    if (!this.inspectorMode) {
      this.target.innerHTML = ''
      this.log.push({ name: payload.name, string: this.colorize(string, payload) })
      this.refresh()
    }
  },
  refresh() {
    this.target.innerHTML = ''
    this.log.forEach((line, index) => {
      if (line.string.includes(this.currentFocus)) {
        this.target.innerHTML += `<span style="display:inline-block;background:var(--solid-gray);font-size:1.5rem;padding:.25rem .5rem;text-align:right;width:3.25rem;">${index}</span> ${
          line.string
        }<br>`
      }
    })
    this.target.scrollTop = this.target.scrollHeight - this.target.offsetHeight
  },
  setFocus(item) {
    this.currentFocus = item ? item.name : ''
    this.currentFocusName.innerHTML = item ? item.name : '[All]'
    this.refresh()
  },
  toggleInspectorMode() {
    this.modeButton.classList.toggle('off')
    this.inspectorMode = !this.inspectorMode
  },
}

/* assign handlers */
function handlePlayPause() {
  if (inspector.inspectorMode) {
    inspector.setFocus(PL_VIEWER)
    return
  }
  const method = viewer.paused ? 'play' : 'pause'
  viewer[method]()
  this.innerHTML = viewer.paused ? '►' : 'II'
  inspector.expose(`playButton.innerHTML = ${viewer.paused ? '►' : 'II'}`, PL_PLAY_BUTTON)
  inspector.expose(`viewer.${method}()`, PL_VIEWER)
}
function handleProgressChange() {
  progress.style.flexBasis = `${(viewer.currentTime / viewer.duration) * 100}%`
}
function handleSkip() {
  if (inspector.inspectorMode) return
  viewer.currentTime += parseFloat(this.dataset.skip)
  inspector.expose(`viewer.currentTime += ${this.dataset.skip}`, PL_VIEWER)
  inspector.expose(
    `progressBar.style.flexBasis = "${(viewer.currentTime / viewer.duration).toFixed(2) * 100}%"`,
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
const PL_PLAY_BUTTON = { name: 'playButton', regex: /playButton/gi, color: 'var(--solid-orange)' }
const PL_PROGRESS = { name: 'progressBar', regex: /progressBar/gi, color: 'var(--solid-green)' }
const PL_VOLUME = { name: 'volumeSlider', regex: /volumeSlider/gi, color: 'var(--solid-goldenrod)' }
const PL_PLAYBACK = {
  name: 'playbackRateSlider',
  regex: /playbackRateSlider/gi,
  color: 'var(--solid-pink)',
}

/* state variables */
let canScrub = false

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
  inspector.expose(`playbackRateSlider.value = ${e.target.value}`, PL_PLAYBACK)
  inspector.expose(`viewer.playbackRate = ${viewer.playbackRate}`, PL_VIEWER)
})
playbackSlider.addEventListener('click', () => {
  if (inspector.inspectorMode) inspector.setFocus(PL_PLAYBACK)
})
volumeSlider.addEventListener('input', (e) => {
  viewer.volume = e.target.value
  inspector.expose(`volumeSlider.value = ${e.target.value}`, PL_VOLUME)
  inspector.expose(`viewer.volume = ${viewer.volume}`, PL_VIEWER)
})
volumeSlider.addEventListener('click', () => {
  if (inspector.inspectorMode) inspector.setFocus(PL_VOLUME)
})

/* progress bar */
viewer.addEventListener('timeupdate', handleProgressChange)
progressBar.addEventListener('mousedown', () => {
  if (inspector.inspectorMode) inspector.setFocus(PL_PROGRESS)
  else {
    canScrub = true
  }
})
progressBar.addEventListener('mousemove', (e) => {
  if (canScrub) handleScrub.call(progressBar, e)
})
progressBar.addEventListener('mouseup', (e) => {
  if (canScrub) {
    handleScrub.call(progressBar, e)
    inspector.expose(`viewer.currentTime = ${viewer.currentTime.toFixed(2)}s`, PL_VIEWER)
    inspector.expose(
      `progressBar.style.flexBasis = "${(viewer.currentTime / viewer.duration).toFixed(2) * 100}%"`,
      PL_PROGRESS,
    )
    canScrub = false
  }
})

/* RENDER */
window.onload = () => {
  inspector._mount()
}
window.onresize = () => {
  inspector._render()
}
