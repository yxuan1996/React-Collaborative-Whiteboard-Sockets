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

- We modify our `endDrawing()` function to send our canvas image to our server after we stop drawing. 
- `canvas.toDataURL` converts our canvas image to a URL containing a png image. We can also specify our image format. 

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

#### Brush Color and Brush Size
In `App.jsx` we create 2 states to manage the brush color and brush size properties. 

We also create 2 inputs that control the brush color and brush size. When the inputs are changed, we set the states for brush color and brush size. 

Lastly, we pass the 2 states as props into the Board component. 

#### Responsive Canvas
To make our Canvas Responsive, we will fetch the width and height of our window, and resize the canvas accordingly. 

```JSX
    const [windowSize, setWindowSize] = useState([
        window.innerWidth,
        window.innerHeight,
    ]);


    useEffect(() => {
        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };


        window.addEventListener('resize', handleWindowResize);


        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);




    return (
        <canvas
            ref={canvasRef}
            width={windowSize[0] > 600 ? 600 : 300}
            height={windowSize[1] > 400 ? 400 : 200}
            style={{ backgroundColor: 'white' }}
        />
    );
```

#### Liveblocks
We modify our frontend client to use liveblocks as the backend. 

Liveblocks is a hosted websockets service that is useful for realtime multiplayer apps

Install Liveblocks
```
npm install @liveblocks/client @liveblocks/react
```

Create `liveblocks.config.ts` file
```
npx create-liveblocks-app@latest --init --framework react
```

Pass our public API key into `createClient`

We need to create a room to host our multiplayer interactions. 

In `App.jsx`
- We create a room with a specific id using `<RoomProvider>`
- We use `ClientSideSuspense` to show a loading screen when the connection loads
- We wrap our existing code in between RoomProvider and ClientSideSuspense

```jsx
import { RoomProvider } from "../liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";

<RoomProvider id="whiteboard" initialPresence={{}}>
      <ClientSideSuspense fallback={<div>Loading…</div>}>
      // Existing code must be returned as a function
      {() => Existing Code Here }
      </ClientSideSuspense>
</RoomProvider>
```

In `board.jsx` we will broadcast events and use an Event Listener to respond and update the board accordingly. 

```jsx
import {
    useBroadcastEvent,
    useEventListener,
  } from "../../liveblocks.config";

const broadcast = useBroadcastEvent();

// Event Listener
useEventListener(({ event, user, connectionId }) => {
        if (event.type === "canvasImage") {
          // Create an image object from the data URL
          const image = new Image();
          image.src = event.value;
          console.log(event.value)
          console.log(user)


          const canvas = canvasRef.current;
          // eslint-disable-next-line react-hooks/exhaustive-deps
          const ctx = canvas.getContext('2d');
          // Draw the image onto the canvas
          image.onload = () => {
              ctx.drawImage(image, 0, 0);
          };
        }
      });

    // Broadcast Image
    const endDrawing = () => {
            const canvas = canvasRef.current;
            const dataURL = canvas.toDataURL(); // Get the data URL of the canvas content

            // Send the dataURL or image data to the socket
            broadcast({ type: "canvasImage", emoji: "🔥", value: dataURL })
            console.log('drawing ended')

            isDrawing = false;
        };

```