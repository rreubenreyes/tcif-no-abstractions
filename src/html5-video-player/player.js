/* grab elements */
const player = document.querySelector('.player')
const viewer = player.querySelector('.viewer')
const [ playButton, ...skipButtons ] = player.querySelectorAll('button')
const progressBar = player.querySelector('.progress')
const progress = player.querySelector('.progress__filled')
const volumeSlider = player.querySelector('[name="volume"]')
const playbackSlider = player.querySelector('[name="playbackRate"]')

/* assign handlers */
function handlePlayPause() {
	const method = viewer.paused ? 'play' : 'pause'
	viewer[method]()	
	this.innerHTML = viewer.paused ? '►' : 'II'
}
function handleProgressChange() {
	progress.style.flexBasis = `${(viewer.currentTime / viewer.duration) * 100}%`
}
function handleSkip() {
	viewer.currentTime += parseFloat(this.dataset.skip)
	handleProgressChange()
}
function handleScrub(e) {
	const percent = e.offsetX / this.offsetWidth
	progress.style.flexBasis = `${percent * 100}%`
	viewer.currentTime = parseFloat(percent) * viewer.duration
}

/* state variables */
let canScrub = false

/* listeners */
/* buttons */
viewer.addEventListener('click', handlePlayPause.bind(playButton))
playButton.addEventListener('click', handlePlayPause)
skipButtons.forEach(button => { button.addEventListener('click', handleSkip) })

/* sliders */
playbackSlider.addEventListener('input', e => { viewer.playbackRate = e.target.value })
volumeSlider.addEventListener('input', e => { viewer.volume = e.target.value })

/* progress bar */
viewer.addEventListener('timeupdate', handleProgressChange)
progressBar.addEventListener('mousedown', () => { canScrub = true })
progressBar.addEventListener('mousemove', e => { canScrub && handleScrub.call(progressBar, e) })
progressBar.addEventListener('mouseup', e => { 
	handleScrub.call(progressBar, e) 
	canScrub = false 
})