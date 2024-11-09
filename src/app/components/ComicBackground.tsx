import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  hasSurprise: boolean;
  surpriseType: 'points' | 'confetti' | 'emoji' | 'message' | 'gift' | 'none';
  surpriseValue: string;
}

const colors = ['#A5F3FC', '#BAE6FD', '#93C5FD']; // Light blue shades

const surpriseMessages = [
  '🎉 Awesome!',
  '⭐ Great job!',
  '🌟 Amazing!',
  '🎨 Beautiful!',
  '🚀 Fantastic!',
];

const surpriseEmojis = [
  '🎨',
  '🎮',
  '🎸',
  '🎪',
  '🎭',
  '🎬',
  '🎢',
  '🎡',
  '🎠',
  '🎪',
  '🎯',
  '🎲',
  '🎳',
  '🎹',
  '🎺',
  '🎻',
  '🎼',
  '🎵',
  '🎶',
  '🎩',
  '🎪',
  '🎭',
  '🎨',
  '🎯',
  '🎱',
  '🎲',
  '🎮',
  '🕹️',
  '🎰',
  '🎳',
  '🎯',
  '🎪',
  '🎭',
  '🎨',
  '🎬',
  '🎤',
  '🎧',
  '🎼',
  '🎹',
  '🎸',
  '🎺',
  '🎻',
  '🥁',
  '🎷',
  '🎵',
  '🎶',
  '🎙️',
  '🎚️',
  '🎛️',
  '🎞️',
];

const giftItems = [
  '🎁 +10 Points!',
  '🎵 Music Note!',
  '🌈 Rainbow!',
  '⚡ Power Up!',
  '🍭 Candy!',
  '🎉 Party!',
];

const ComicBackground: React.FC = () => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);

  const createBalloon = () => {
    const hasSurprise = Math.random() < 0.4; // 40% chance for surprise
    const surpriseTypes = ['points', 'confetti', 'emoji', 'message', 'gift'];
    const surpriseType = hasSurprise
      ? surpriseTypes[Math.floor(Math.random() * surpriseTypes.length)]
      : 'none';

    let surpriseValue = '';
    if (surpriseType === 'message') {
      surpriseValue =
        surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
    } else if (surpriseType === 'emoji') {
      surpriseValue =
        surpriseEmojis[Math.floor(Math.random() * surpriseEmojis.length)];
    } else if (surpriseType === 'gift') {
      surpriseValue = giftItems[Math.floor(Math.random() * giftItems.length)];
    }

    const newBalloon: Balloon = {
      id: Date.now(),
      x: Math.random() * (window.innerWidth - 80),
      y: window.innerHeight + 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * (150 - 100) + 50,
      speed: Math.random() * (2 - 1) + 0.5,
      hasSurprise,
      surpriseType: surpriseType as Balloon['surpriseType'],
      surpriseValue: surpriseValue || 'Pop!',
    };
    setBalloons((prev) => [...prev, newBalloon]);
  };

  useEffect(() => {
    const interval = setInterval(createBalloon, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      setBalloons((prev) =>
        prev
          .map((balloon) => ({
            ...balloon,
            y: balloon.y - balloon.speed,
          }))
          .filter((balloon) => balloon.y > -100)
      );
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handlePop = (balloon: Balloon) => {
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    // Handle different surprise types
    switch (balloon.surpriseType) {
      case 'points':
        setScore((prev) => prev + 5);
        showFloatingText('+5 Points!', balloon.x, balloon.y);
        break;
      case 'confetti':
        confetti({
          particleCount: 150,
          spread: 180,
          origin: {
            x: balloon.x / window.innerWidth,
            y: balloon.y / window.innerHeight,
          },
          colors: colors,
        });
        break;
      case 'emoji':
        showFloatingEmoji(balloon.surpriseValue, balloon.x, balloon.y);
        setScore((prev) => prev + 2);
        break;
      case 'message':
        showFloatingText(balloon.surpriseValue, balloon.x, balloon.y);
        setScore((prev) => prev + 3);
        break;
      case 'gift':
        showGiftAnimation(balloon.x, balloon.y);
        setScore((prev) => prev + 10);
        break;
      default:
        setScore((prev) => prev + 1);
        showFloatingText('Pop!', balloon.x, balloon.y);
    }
  };

  const showFloatingText = (text: string, x: number, y: number) => {
    const element = document.createElement('div');
    element.className = 'floating-text';
    element.innerText = text;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    document.body.appendChild(element);
    setTimeout(() => element.remove(), 1000);
  };

  const showFloatingEmoji = (emoji: string, x: number, y: number) => {
    const element = document.createElement('div');
    element.className = 'floating-emoji';
    element.innerText = emoji;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    document.body.appendChild(element);
    setTimeout(() => element.remove(), 1500);
  };

  const showGiftAnimation = (x: number, y: number) => {
    const element = document.createElement('div');
    element.className = 'gift-animation';
    element.innerHTML = '🎁';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    document.body.appendChild(element);
    setTimeout(() => element.remove(), 2000);
  };

  return (
    <div className="fixed inset-0 pointer-events-auto overflow-hidden">
      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-glow filter-glow text-lg font-bold text-blue-600 transform hover:scale-105 transition-transform duration-200">
        Score: {score}
      </div>

      <div className="absolute top-6 left-4 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-glow filter-glow text-lg font-bold text-blue-600 flex flex-col items-start">
        <div>Pop balloons</div>
        <div className="mt-1">for surprises!</div>
      </div>

      <AnimatePresence>
        {balloons.map((balloon) => (
          <motion.div
            key={balloon.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute pin-cursor"
            style={{
              left: balloon.x,
              top: balloon.y,
              width: balloon.size,
              height: balloon.size * 1.2,
            }}
            onClick={() => handlePop(balloon)}
          >
            <div
              className="balloon-string absolute left-1/2 top-full w-0.5 h-12 -translate-x-1/2"
              style={{ backgroundColor: balloon.color }}
            />
            <svg
              viewBox="0 0 50 60"
              className="w-full h-full transform -translate-y-2"
            >
              <path
                d="M25 0 C10 0 0 10 0 25 C0 40 10 50 25 50 C40 50 50 40 50 25 C50 10 40 0 25 0"
                fill={balloon.color}
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ComicBackground;
