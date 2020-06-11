let hamburger = document.querySelector('.hamburger');
let menu = document.querySelector('.menu');
let links = document.querySelectorAll('.menu-link');
let play = document.querySelector('#play');
let ytVideo = document.querySelector('.yt-video');

hamburger.addEventListener('click', () => {
  menu.classList.toggle('full-screen');
})

links.forEach((e) => {
  e.addEventListener('click', () => {
    menu.classList.toggle('full-screen');
  })
})

play.addEventListener('click', () => {
  ytVideo.classList.remove('hide');
  console.log('hello');
})