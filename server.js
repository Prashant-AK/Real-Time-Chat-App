const path=require('path');
const http=require('http');

const express=require('express');
const socketio=require('socket.io');

const app =express();
const server=http.createServer(app);
const io= socketio(server);
const formatMessage=require('./chat_utility/message');
const {userJoin, getCurrentUser,userLeaveChat,getRoomUsers}=require('./chat_utility/users');
const chatAdmin='ChatBox'  //--> Using it as a user name

app.use(express.static(path.join(__dirname,'public')));

io.on('connection',socket=>{
    console.log('New ws connecton opened')
    
    socket.on('joinRoom',({username,room})=>{
        
        const user=userJoin(socket.id,username,room)
        socket.join(user.room)



    //Welcoming the new User
    socket.emit('message',formatMessage(username,'Welcome to ChatBox'));  //-->  to the single client

    //Broadcast when a user connects --> to all the Clients except the connecting one
    socket.broadcast.to(user.room).emit(
        'message',
        formatMessage(chatAdmin,`${user.username} has joined the chat`));
    // io.emit() //--> to all the clients

    //Send users and room info
    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
    });
    });

    //Listen for the chatMesssage send from the client side
    socket.on('chatMessage',msg=>{
        const user=getCurrentUser(socket.id);
        // console.log(msg);
        io.to(user.room).emit('message',formatMessage(user.username,msg))

        // Runs when the client disconnet from the chat room
        socket.on('disconnect',()=>{
            const user=userLeaveChat(socket.id);
            if(user){
                // console.log(`${user.username} Logged out`);
                io.to(user.room).emit(
                    'message',
                    formatMessage(chatAdmin,`${user.username} has left the chat`));                
                
                io.to(user.room).emit('roomUsers',{
                    room:user.room,
                    users:getRoomUsers(user.room)
                });
            }

        });
    })




});

const PORT=process.env.PORT ||8000;
server.listen(PORT,()=>{console.log(`Server is running at port ${PORT}`);
})