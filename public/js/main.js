const chatForm= document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const roomUsers=document.getElementById('users');
const socket=io();
//Get Username and room from URL
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
});

// console.log(username,room);

//Join Chatroom
socket.emit('joinRoom',{username, room})

//Message from the server
socket.on('message',message=>{
    console.log(message);
    outputMessage(message);

    //Scrolling Down yaxis
    chatMessages.scrollTop=chatMessages.scrollHeight;
    
});

//Get room and users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
})

//Message Submit
chatForm.addEventListener('submit',e=>{
    e.preventDefault(); //-->prevent page from loading automatically
    const mesage = e.target.elements.msg.value; //--> Get message text from the UI
    socket.emit('chatMessage',mesage); //--> Emitting message to the server
    // console.log(mesage); //--> console to the browser
    
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
    
})

//Output message to the dom
function outputMessage(message){
    const div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`	<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">${message.text}</p>`
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room and name to Dom

function outputRoomName(room){
     roomName.innerText=room;
}

//Add users to DOM
function outputUsers(users){
    roomUsers.innerHTML=
        `${users.map(list=>`<li>${list.username}</li>`).join('')}`;
}
