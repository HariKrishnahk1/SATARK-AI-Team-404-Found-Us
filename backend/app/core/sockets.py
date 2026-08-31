import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)

socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    print(f"[Socket.io] Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"[Socket.io] Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    room = data.get("room")
    if room:
        sio.enter_room(sid, room)
        print(f"[Socket.io] Client {sid} joined room: {room}")

async def broadcast_event(event_name: str, payload: dict, room: str = None):
    try:
        await sio.emit(event_name, payload, room=room)
        print(f"[Socket.io Broadcast] Event: {event_name} -> Payload keys: {list(payload.keys())}")
    except Exception as e:
        print(f"[Socket.io Broadcast Error] {e}")
