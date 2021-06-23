gsap.from(".welcome .hand-left", {
  delay: 0.5,
  duration: 1.5,
  x: "100%",
  rotation: "30deg",
});

// Observer setup
const firstPost = document.querySelector("main");

function callback(entries, observer) {
  console.log("entries:", entries);
  console.log("observer:", observer);
}

const observer = new IntersectionObserver(callback);

observer.observe(firstPost);
