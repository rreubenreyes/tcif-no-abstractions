/* elements */
const slide = document.querySelector(`.slide`)
const buttons = document.querySelectorAll(`.controls__button`)

/* listeners */
buttons.forEach(button => button.addEventListener('click', handleClick))

/* behavior */
function handleClick() {
  const curClass = slide.classList[1]
  if (curClass == this.dataset.action) return
  else if (slide.classList.length - 1) slide.classList.remove(curClass)
  else slide.classList.add(this.dataset.action)
}
