const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessages,generatelocationMessages}=require('./utls/messages')
const app=express()
const server=http.createServer(app)
const io=socketio(server)
const {addUser,getUser,getUsersInRoom,removeUser}=require('./utls/users')
const port=process.env.PORT || 3000

const PublicDirectoryPath=path.join(__dirname,'../public')
app.use(express.static(PublicDirectoryPath))


io.on('connection',(socket)=>{
    console.log('New Websocket connection')
    socket.on('join',({username,room},callback)=>{
        const {user,error}=addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessages('Admin','Welcome!!'))
        socket.broadcast.to(user.room).emit('message',generateMessages('Admin',`${user.username} has joined!!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
            callback()
        //socket.emit ->person  io.emit ->to the whole people    socket.broadcast.emit ->the whole people except the person we mean 
    })

   
   
    socket.on('sendMsg',(message,callback)=>{
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('profanity is not allawed!!')
        }
        const user =getUser(socket.id)
        io.to(user.room).emit('message',generateMessages(user.username,message))
        callback()
    })

socket.on('sendLocation',(coords,callback)=>{
    const user=getUser(socket.id)
    io.to(user.room).emit('sendlocation',generatelocationMessages(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
})

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessages('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

})

server.listen(port,()=>{
    console.log('Server is up on port '+port)
})