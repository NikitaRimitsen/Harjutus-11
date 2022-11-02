const http = require('http');
const fs = require('fs');
const ws = new require('ws')

//создаем вебсокет сервер
const wss = new ws.Server({noServer: true});

//при подключении на адресс /ws, подключаем человека к сокет серверу
function accept(req, res){
    if(req.url === '/ws' && req.headers.upgrade &&
        req.headers.upgrade.toLowerCase() === 'websocket' &&
        req.headers.connection.match(/\bupgrade\b/i)){
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
    } else if(req.url === '/'){
        fs.createReadStream('./index.html').pipe(res);
    } else{
        res.writeHead(404);
        res.end()
    }
}

//создаем сет из клиентов
const clients = new Set();

//при присоединении к сокету, устанавливем следующие эвенты подключившемуся пользователю
function onSocketConnect(ws){
    clients.add(ws)
//при получении сообщения
    ws.on('message', function(message){
        message = message.slice(0, 50);
        for(let client of clients) {clients.send(message);}
    });
//при закрытии сокета
    ws.on('close', function (){
        log('connection closed');
        clients.delete(ws);
    })
}

let log;

if(!module["parent"]){
    log = console.log();
//создаем сервер
    http.createServer(accept).listen(8080);
} else {
    log = function () {};
    exports.accept = accept;
}