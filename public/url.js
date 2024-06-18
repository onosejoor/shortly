
let shortUrl = document.getElementsByClassName("sh").length;
let copy = document.getElementsByClassName("copy");

// For Nav Bar //

function navBar() {
  const nav = $(".nav-contents");
  nav.toggleClass("toogle");
}

$(".svg-icon").click(() => {
  navBar();
});

function change() {
  let input = document.querySelector(".input");
  let error = document.querySelector(".error");
  if (input.value.length === 0) {
    error.style.visibility = "visible";
    input.classList.add("input2");
  }
}

// for clipboard copy

for (let i = 0; i < shortUrl; i++) {
  let copied = document.getElementsByClassName("copy")[i];

  copied.addEventListener("click",function () {

    for (let j = 0; j < copy.length; j++) {
    copy[j].classList.remove("copied");
    $(this).addClass("copied");
    $(".copy").text("Copy");
    $(this).text("Copied!");
    console.log(this);
    }

    // get the container
    const element = document.querySelectorAll(".short")[i];

    // Create a fake `textarea` and set the contents to the text
    // you want to copy
    const storage = document.createElement("textarea");
    storage.value = element.innerHTML;
    element.appendChild(storage);

    // Copy the text in the fake `textarea` and remove the `textarea`
    storage.select();
    storage.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(storage.value);
    element.removeChild(storage);
  });
}