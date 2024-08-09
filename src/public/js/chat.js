const socket = io();

const messagesChat = document.getElementById('messagesChat')
const messagesBox = document.getElementById('messagesBox')
const btnChat = document.getElementById('btnChat');
let user

Swal.fire({
    title: "Identificacion de usuario",
    text: "Por favor ingrese su email",
    input: "text",
    inputValidator: (valor) => {
        return !valor && "Ingrese un email valido"
    },
    allowOutsideClick: false
}).then(resultado => {
    user = resultado.value
    console.log(user)
})

btnChat.addEventListener('click',()=> {
    const message = messagesBox.value.trim();

    if(message !== ''){

        socket.emit('chatMessages', {user, message});
        messagesBox.value = '';
    }
})


socket.on('Message', (data) => {
    const messagesDiv = document.getElementById('messagesChat');
    const messageHTML = `<div class="message">
                            <span class="username">${data.user}:</span>
                            <span class="date">${data.date.toLocaleString()}</span>
                            <p class="message-text">${data.message}</p>
                         </div>`;
    messagesDiv.innerHTML += messageHTML;
});