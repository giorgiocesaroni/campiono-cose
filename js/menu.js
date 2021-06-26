let hamburger = document.querySelector(".hamburger");
let menu = document.querySelector("#menu");

hamburger.onclick = () => {
  menu.classList.toggle("extended");
  document.body.classList.toggle("modal-open");
};

menu.onclick = () => {
  menu.classList.remove("extended");
  document.body.classList.toggle("modal-open");
};
