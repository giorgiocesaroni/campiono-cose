let header = document.querySelector('.top');
let hamburger = document.querySelector('.hamburger');
let menu = document.querySelector('#menu')

hamburger.addEventListener('click', (e) => {
  header.classList.toggle('extended');
  document.body.classList.toggle('modal-open');
})

menu.addEventListener('click', (e) => {
  header.classList.remove('extended');
  document.body.classList.remove('modal-open');
})