var menu = document.querySelector("header")
var menuHamburguer = document.querySelector(".navMenuHamburguer")

menuHamburguer.addEventListener("click", ()=> {
    menu.classList.toggle("ativo")
})