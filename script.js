const fullPage = document.querySelector('.full-page')
const extraHeading = document.querySelector('h5')
const enterBtn = document.querySelector('.enter-btn')

enterBtn.addEventListener('click',()=>{
    fullPage.classList.add('out')
    extraHeading.classList.add('out')
    setTimeout(() => {
        window.location.href = 'index2.html'  //Like this added beacuse the animation will be missed otherwise.
    }, 500);
})

document.addEventListener('keydown',(e)=>{
    if(e.key==="Enter"){
        fullPage.classList.add('out')
        extraHeading.classList.add('out')
        setTimeout(()=>{
            window.location.href = 'index2.html'
        },500)
    }   
})
// script.js mein ye add karo

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});