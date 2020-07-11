let header = document.querySelector('.top');
let hamburger = document.querySelector('.hamburger');

hamburger.addEventListener('click', (e) => {
  header.classList.toggle('extended');
})

// links.forEach((e) => {
//   e.addEventListener('click', () => {
//     menu.classList.toggle('full-screen');
//   })
// })

// play.addEventListener('click', () => {
//   ytVideo.classList.remove('hide');
//   console.log('hello');
// })