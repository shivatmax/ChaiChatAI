import React, { useEffect, useRef } from 'react';

const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      twinkle: number;
    }[] = [];
    const numStars = 100;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1, // Increased size range from 1-4
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 + 0.5,
        twinkle: Math.random() * 0.1,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';

      stars.forEach((star) => {
        ctx.beginPath();
        // Apply twinkling effect
        const twinkleRadius =
          star.radius * (1 + Math.sin(Date.now() * star.twinkle) * 1);
        ctx.arc(star.x, star.y, twinkleRadius, 0, Math.PI * 2);
        ctx.fill();

        star.x += star.vx;
        star.y += star.vy;

        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className='fixed top-0 left-0 w-full h-full pointer-events-none'
    />
  );
};

export default StarryBackground;
