const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html= Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        CreatedAt:moment(message.CreatedAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
autoscroll()
})

socket.on('sendlocation',(lo)=>{
console.log(lo.lo)
const html=Mustache.render(locationTemplate,{
    username:lo.username,
    lo:lo.lo,
    CreatedAt:moment(lo.CreatedAt).format('hh:mm A')
})
$messages.insertAdjacentHTML('beforeend',html)
autoscroll()
})

socket.on('roomData',({room,users})=>{
   const html=Mustache.render(sidebarTemplate,{
    users,
    room    
   })
    document.querySelector('#sidebar').innerHTML=html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    //disable
    const message=e.target.elements.message.value
    socket.emit('sendMsg',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')  
        $messageFormInput.value=''
        $messageFormInput.focus()
        //enable
    if(error){
    return console.log(error)
    }

    console.log('Message is deliverd')
    })
})


$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    //disable
    navigator.geolocation.getCurrentPosition((pos)=>{
       socket.emit('sendLocation',{
        longitude:pos.coords.longitude,
        latitude:pos.coords.latitude
       },()=>{
        $sendLocationButton.removeAttribute('disabled')
       console.log(`location is shared!!`)
       })
   
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})