import React, { useRef, useEffect, useState } from 'react';
// import io from 'socket.io-client';
import {
    useBroadcastEvent,
    useEventListener,
  } from "../../liveblocks.config";

const Board = (props) => {

    const { brushColor, brushSize, clearCanvas, setClearCanvas } = props;

    const canvasRef = useRef(null);

    const broadcast = useBroadcastEvent();


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
        if (event.type === "clearCanvas") {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // reset clearCanvas state
            setClearCanvas(false);
  
          }
      });

    // Drawing Logic
    // Run once after the canvas is rendered
    useEffect(() => {
        // Variables to store drawing state
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;


        const startDrawing = (e) => {
            isDrawing = true;
            console.log(`drawing started`, brushColor, brushSize);

            [lastX, lastY] = [e.offsetX, e.offsetY];
        };


        // Function to draw
        const draw = (e) => {
            if (!isDrawing) return;


            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();
            }


            [lastX, lastY] = [e.offsetX, e.offsetY];
        };


        // Function to end drawing
        const endDrawing = () => {
            const canvas = canvasRef.current;
            const dataURL = canvas.toDataURL(); // Get the data URL of the canvas content

            // Send the dataURL or image data to the socket
            broadcast({ type: "canvasImage", emoji: "🔥", value: dataURL })
            console.log('drawing ended')
            // if (socket) {
            //     socket.emit('canvasImage', dataURL);
            //     console.log('drawing ended')
            // }

            isDrawing = false;
        };


        const canvas = canvasRef.current;
        const ctx = canvasRef.current?.getContext('2d');


        // Set initial drawing styles
        if (ctx) {
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize;


            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';


        }
        // Event listeners for drawing
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDrawing);
        canvas.addEventListener('mouseout', endDrawing);


        return () => {
            // Clean up event listeners when component unmounts
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', endDrawing);
            canvas.removeEventListener('mouseout', endDrawing);
        };
    }, [brushColor, brushSize]);

    // function to clear canvas
    useEffect(() => {
        if (clearCanvas == true){
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // reset clearCanvas state
            setClearCanvas(false);

            // Send the dataURL or image data to the socket
            broadcast({ type: "clearCanvas", emoji: "🔥" })
            console.log('clear Canvas')
        }
        
    },[clearCanvas]);

    // Get Current Window Size
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
};


export default Board;