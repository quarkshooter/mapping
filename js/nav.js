/* Open when someone clicks on the span element */
function openNav() {
  $(".hamburger").toggleClass("is-active");
  document.getElementById("myNav").style.height = "100%";
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
  $(".hamburger").toggleClass("is-active");
  document.getElementById("myNav").style.height = "0%";
}

function toggleNav() {
  $(".hamburger").toggleClass("is-active");
  $(".nav").toggleClass("visible");
}
