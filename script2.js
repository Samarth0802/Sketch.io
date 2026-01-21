document.addEventListener('DOMContentLoaded', function(){
    const savedTitle = localStorage.getItem('titleName')
    const title = document.querySelector('#projectName')
    const closeBtn = document.querySelector('.close-btn')
    const leftSide = document.querySelector('.left-side')
    const openBtn = document.querySelector('.open-btn')
    
    // Title part
    title.addEventListener('input', () => {
        localStorage.setItem('titleName', title.value)
    })

    if(savedTitle){
        title.value = savedTitle
    }

    // Close sidebar
    closeBtn.addEventListener('click', function(){
        leftSide.style.transform = 'translateX(-100%)'
        leftSide.style.display = 'none'
        openBtn.style.opacity = 1
        openBtn.style.display = 'block'
    })
    
    // Open sidebar
    openBtn.addEventListener('click', function(){
        leftSide.style.display = 'flex' // Pehle display flex karo
        leftSide.style.transform = 'translateX(0%)'
        openBtn.style.opacity = 0
        openBtn.style.display = 'none'
    })
})