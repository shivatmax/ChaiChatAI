import { logger } from '../utils/logger';
import React, { useEffect, useRef, useState, useCallback } from 'react';

const ComicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState<number | null>(null);
  const comicElementsRef = useRef<
    Array<{
      x: number;
      y: number;
      image: HTMLImageElement;
      scale: number;
      rotation: number;
      velocityX: number;
      velocityY: number;
      mass: number;
    }>
  >([]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    comicElementsRef.current.forEach((element, index) => {
      drawComicElement(ctx, element);

      if (!isDragging || draggedElement !== index) {
        // Slow down the movement
        element.x += element.velocityX * 0.1;
        element.y += element.velocityY * 0.1;
        element.rotation += 0.001;

        // Bounce off the walls with damping
        if (element.x < 0 || element.x > canvas.width) {
          element.velocityX *= -0.8;
          element.x = element.x < 0 ? 0 : canvas.width;
        }
        if (element.y < 0 || element.y > canvas.height) {
          element.velocityY *= -0.8;
          element.y = element.y < 0 ? 0 : canvas.height;
        }

        // Check collision with other elements
        for (let j = index + 1; j < comicElementsRef.current.length; j++) {
          checkCollision(element, comicElementsRef.current[j]);
        }

        // Apply friction to slow down movement
        element.velocityX *= 0.99;
        element.velocityY *= 0.99;
      }
    });

    requestAnimationFrame(animate);
  }, [isDragging, draggedElement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const numElements = 11;
    const iconPaths = [
      '/images/comic/1.png',
      '/images/comic/2.png',
      '/images/comic/3.png',
      '/images/comic/4.png',
      '/images/comic/5.png',
      '/images/comic/6.png',
      '/images/comic/7.png',
      '/images/comic/8.png',
      '/images/comic/9.png',
      '/images/comic/10.png',
      '/images/comic/11.png',
    ];

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
          logger.warn(`Failed to load image: ${src}`);
        };
        img.src = src;
      });
    };

    const initializeElements = async () => {
      comicElementsRef.current = []; // Reset the elements array
      for (let i = 0; i < numElements; i++) {
        const imagePath = iconPaths[i];
        try {
          const image = await loadImage(imagePath);
          comicElementsRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            image: image,
            scale: Math.random() * 0.15 + 0.1,
            rotation: Math.random() * Math.PI * 2,
            velocityX: (Math.random() - 0.5) * 0.5, // Reduced initial velocity
            velocityY: (Math.random() - 0.5) * 0.5, // Reduced initial velocity
            mass: Math.random() * 0.5 + 0.5,
          });
        } catch (error) {
          logger.error(`Failed to load image: ${imagePath}`, error);
        }
      }
      animate();
    };

    initializeElements();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      for (let i = comicElementsRef.current.length - 1; i >= 0; i--) {
        const element = comicElementsRef.current[i];
        const dx = mouseX - element.x;
        const dy = mouseY - element.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (element.image.width * element.scale) / 2) {
          setIsDragging(true);
          setDraggedElement(i);
          // Reset velocity when starting to drag
          element.velocityX = 0;
          element.velocityY = 0;
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && draggedElement !== null) {
        const rect = canvas.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;
        const element = comicElementsRef.current[draggedElement];

        // Update position
        element.x = newX;
        element.y = newY;

        // Calculate new velocity based on movement (reduced for slower movement)
        element.velocityX = (newX - element.x) * 0.05;
        element.velocityY = (newY - element.y) * 0.05;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedElement(null);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', (e) =>
      handleMouseDown(e.touches[0] as unknown as MouseEvent)
    );
    canvas.addEventListener('touchmove', (e) =>
      handleMouseMove(e.touches[0] as unknown as MouseEvent)
    );
    canvas.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', (e) =>
        handleMouseDown(e.touches[0] as unknown as MouseEvent)
      );
      canvas.removeEventListener('touchmove', (e) =>
        handleMouseMove(e.touches[0] as unknown as MouseEvent)
      );
      canvas.removeEventListener('touchend', handleMouseUp);
    };
  }, [animate, draggedElement, isDragging]);

  function drawComicElement(
    ctx: CanvasRenderingContext2D,
    element: (typeof comicElementsRef.current)[0]
  ) {
    ctx.save();
    ctx.translate(element.x, element.y);
    ctx.rotate(element.rotation);
    ctx.scale(element.scale, element.scale);

    const width = element.image.width;
    const height = element.image.height;
    ctx.drawImage(element.image, -width / 2, -height / 2, width, height);

    ctx.restore();
  }

  function checkCollision(
    a: (typeof comicElementsRef.current)[0],
    b: (typeof comicElementsRef.current)[0]
  ) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (a.image.width * a.scale + b.image.width * b.scale) / 2;

    if (distance < minDistance) {
      const angle = Math.atan2(dy, dx);
      const targetX = a.x + Math.cos(angle) * minDistance;
      const targetY = a.y + Math.sin(angle) * minDistance;

      // Reduce the collision force for slower movement
      const ax = (targetX - b.x) * 0.01;
      const ay = (targetY - b.y) * 0.01;

      // Apply damping to the collision response
      const damping = 0.8;
      a.velocityX -= (ax / a.mass) * damping;
      a.velocityY -= (ay / a.mass) * damping;
      b.velocityX += (ax / b.mass) * damping;
      b.velocityY += (ay / b.mass) * damping;

      // Ensure minimum velocity for a bouncy effect
      const minVelocity = 0.1;
      a.velocityX =
        Math.sign(a.velocityX) * Math.max(Math.abs(a.velocityX), minVelocity);
      a.velocityY =
        Math.sign(a.velocityY) * Math.max(Math.abs(a.velocityY), minVelocity);
      b.velocityX =
        Math.sign(b.velocityX) * Math.max(Math.abs(b.velocityX), minVelocity);
      b.velocityY =
        Math.sign(b.velocityY) * Math.max(Math.abs(b.velocityY), minVelocity);
    }
  }

  return (
    <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />
  );
};

export default ComicBackground;
