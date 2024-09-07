import React, { useRef, useEffect } from 'react';
import './SignaturePad.css'; 

interface SignaturePadProps {
  width?: number;
  height?: number;
  style?:object;
  clrBtnStyle?:object;
  saveBtnStyle?:object;
  onSaveImage: (dataUrl: string) => void;
  theme?: 'light' | 'dark'; 
  strokeColor?: string; 
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSaveImage,
  style,
  width,
  height,
  clrBtnStyle,
  saveBtnStyle,
  theme = 'light', 
  strokeColor = '#000' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!context || !canvas) return;

    // Adjust canvas size to the container's size
    const adjustCanvasSize = () => {
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    };

    adjustCanvasSize();
    window.addEventListener('resize', adjustCanvasSize);

    const getMousePosition = (event: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (event instanceof MouseEvent) {
        return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
      } else {
        const touch = event.touches[0];
        return { x: (touch.clientX - rect.left) * (canvas.width / rect.width), y: (touch.clientY - rect.top) * (canvas.height / rect.height) };
      }
    };

    const startDrawing = (event: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      const pos = getMousePosition(event);
      context.beginPath();
      context.moveTo(pos.x, pos.y);
    };

    const draw = (event: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const pos = getMousePosition(event);
      context.lineTo(pos.x, pos.y);
      context.strokeStyle = strokeColor; // Use stroke color prop
      context.lineWidth = 2; // Line width
      context.stroke();
    };

    const stopDrawing = () => {
      if (isDrawing.current) {
        isDrawing.current = false;
        context.closePath();
      }
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      window.removeEventListener('resize', adjustCanvasSize);
    };
  }, [strokeColor]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas?canvas.width:Number(), canvas?canvas.height:Number());
    }
  };

  const saveImage = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSaveImage(dataUrl);
    }
  };

  return (
    <div style={style} className={`signature-pad `}>
      <canvas ref={canvasRef} 
      className={`${theme}`}
      style={{ width: width, height: height }}
       />
      <div className="signature-pad-buttons">
        <button style={clrBtnStyle} type="button" className="clear-btn" onClick={clearCanvas}>Clear Signature</button>
        <button style={saveBtnStyle} type="button" className="save-btn" onClick={saveImage}>Save Signature</button>
      </div>
    </div>
  );
};

export default SignaturePad;
