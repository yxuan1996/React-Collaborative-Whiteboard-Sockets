# React-Collaborative-Whiteboard-Sockets
Collaborative Whiteboard App using React, Socket IO and Node JS

Based on the following tutorial: https://dev.to/fidalmathew/building-a-collaborative-whiteboard-app-using-reactjs-socketio-and-nodejs-2o71

## Development Notes
#### Board UI

In `board.jsx` we create our whiteboard using HTML Canvas. We create a reference to the Canvas using `useRef()`

Next, we define a `useEffect` function that runs once when the board loads. This function will contain event listeners for mouse movements and apply the drawing logic. 

- When the mouse is clicked, run startDrawing()
- When the mouse moves, run draw()
- When the mouse is released, run endDrawing()

In the `draw` function, we get a reference to the Canvas using the previously defined `useRef()` hook and draw some lines based on our mouse coordinates. 

#### Client Socket Connection
First, we need to install 
```
npm install socket.io-client
```

Import the library in `board.jsx`
```jsx
import io from 'socket.io-client';
```

- We create a new state to manage the socket state
- After the Canvas loads, we create a connection to the server and set the socket state

```jsx
const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        console.log(newSocket, "Connected to socket");
        setSocket(newSocket);
    }, []);
```

- We create a new `useEffect` function and set the socket state as a dependency. 
- When the socket state changes, we listen for the `canvasImage` event and draw the received image onto our canvas. 

```jsx
useEffect(() => {

        if (socket) {
            // Event listener for receiving canvas data from the socket
            socket.on('canvasImage', (data) => {
                // Create an image object from the data URL
                const image = new Image();
                image.src = data;


                const canvas = canvasRef.current;
                // eslint-disable-next-line react-hooks/exhaustive-deps
                const ctx = canvas.getContext('2d');
                // Draw the image onto the canvas
                image.onload = () => {
                    ctx.drawImage(image, 0, 0);
                };
            });
        }
    }, [socket]);
```

We modify our `endDrawing()` function to send our canvas image to our server after we stop drawing. 

```jsx
const endDrawing = () => {
            const canvas = canvasRef.current;
            const dataURL = canvas.toDataURL(); // Get the data URL of the canvas content


            // Send the dataURL or image data to the socket
            // console.log('drawing ended')
            if (socket) {
                socket.emit('canvasImage', dataURL);
                console.log('drawing ended')
            }
            isDrawing = false;
        };
```
