const menu = document.querySelector('.hero-header__menu')
const dropdown = document.querySelector('.hero-header__dropdown')
const sectionMobile = document.querySelector('.section-mobile')

menu.addEventListener('click', () => {
    sectionMobile.classList.toggle('is-open');
    dropdown.classList.toggle('is-open');
})