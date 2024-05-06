const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

// 创建 WebSocket 服务器监听在 9998 端口
const wss = new WebSocketServer({ port: 9998 });

// 用于存储连接的客户端列表
const clients = [];

// 服务器被客户端连接
wss.on('connection', (ws) => {
    console.log('客户端已连接');

    // 将新连接的客户端添加到列表中
    clients.push(ws);
    console.log('clients: ', clients);

    // 根据连接状态发送不同的消息
    switch (ws.readyState) {
        case WebSocket.CONNECTING:
            ws.send('连接正在建立，请稍等...');
            break;
        case WebSocket.OPEN:
            ws.send(JSON.stringify({ type: 'msg', data: { username: 'server', msg: '连接成功！欢迎加入聊天室。' } }));
            break;
        case WebSocket.CLOSING:
            ws.send('连接正在关闭...');
            break;
        case WebSocket.CLOSED:
            ws.send('连接已关闭。');
            break;
    }

    // 监听客户端发送的消息
    ws.on('message', (message) => {
        if (typeof message === 'string') {
            // 如果消息是字符串，广播给所有客户端
            console.log('接收客户端消息: ', message);
            broadcastMessage(JSON.parse(message));
        } else {
            // 如果消息是Buffer，将其转换为字符串再广播
            console.log('接收客户端消息', message.toString());
            broadcastMessage(JSON.parse(message.toString()));
        }
    });

    // 客户端断开连接时，从列表中移除
    ws.on('close', () => {
        console.log('客户端已断开连接');
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });
});

// 广播消息给所有客户端
const broadcastMessage = (data) => {
    const messageString = JSON.stringify(data);
    clients.forEach((client) => {
        client.send(messageString);
    });
};
