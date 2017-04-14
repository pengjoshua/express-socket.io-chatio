let express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    usernames = [];

server.listen(process.env.PORT || 3000);
console.log('Server Running...');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
  console.log('Socket Connected...');

  socket.on('new user', (data, cb) => {
    if (usernames.indexOf(data) !== -1) cb(false);
    else {
      cb(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  // Update Usernames
  let updateUsernames = () => {
    io.sockets.emit('usernames', usernames);
  };

  // Send Message
  socket.on('send message', (data) => {
    io.sockets.emit('new message', {msg: data, user: socket.username});
  });

  // Disconnect
  socket.on('disconnect', (data) => {
    if (!socket.username) return;

    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });
});
