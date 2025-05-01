import { useEffect, useRef, useState } from 'react';
import styles from './Game.module.css';
import { GameEngine } from './engine/GameEngine';

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Инициализация игры
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStarted) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Настройка размеров canvas для соответствия размеру экрана
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Создаем или обновляем игровой движок
      if (gameEngineRef.current) {
        gameEngineRef.current.updateDimensions(canvas.width, canvas.height);
      } else {
        gameEngineRef.current = new GameEngine(canvas.width, canvas.height);
      }
    };

    // Вызываем сразу и подписываемся на изменение размера окна
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Обработчик клика/касания
    const handleClick = (e: MouseEvent | TouchEvent) => {
      let x: number;

      if ('touches' in e) {
        // Это сенсорное событие
        x = e.touches[0].clientX;
      } else {
        // Это событие мыши
        x = e.clientX;
      }

      const thirdWidth = canvas.width / 3;

      if (gameEngineRef.current) {
        if (x < thirdWidth) {
          // Левая треть экрана
          console.log('Движение влево');
          gameEngineRef.current.movePlayerLeft();
        } else if (x > thirdWidth * 2) {
          // Правая треть экрана
          console.log('Движение вправо');
          gameEngineRef.current.movePlayerRight();
        }
      }
    };

    // Настройка обработчиков свайпов
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX || !touchStartY) return;

      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;

      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Определяем направление свайпа
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Горизонтальный свайп
        if (diffX > 50) {
          // Свайп вправо
          console.log('Свайп вправо');
          if (gameEngineRef.current) gameEngineRef.current.movePlayerRight();
          touchStartX = touchEndX;
        } else if (diffX < -50) {
          // Свайп влево
          console.log('Свайп влево');
          if (gameEngineRef.current) gameEngineRef.current.movePlayerLeft();
          touchStartX = touchEndX;
        }
      }
    };

    // Обработчик клавиатуры
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameEngineRef.current) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          console.log('Клавиша: влево');
          gameEngineRef.current.movePlayerLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          console.log('Клавиша: вправо');
          gameEngineRef.current.movePlayerRight();
          break;
      }
    };

    // Добавляем обработчики событий
    canvas.addEventListener('click', handleClick as unknown as EventListener);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('keydown', handleKeyDown);

    // Переменные для игрового цикла
    let animationFrameId: number;
    let lastTime = 0;

    // Основной игровой цикл
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Очистка canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Обновление и отрисовка игры
      if (gameEngineRef.current) {
        gameEngineRef.current.update(deltaTime);
        gameEngineRef.current.draw(ctx);

        // Если игра окончена, добавим кнопку для рестарта
        if (gameEngineRef.current.isOver()) {
          // Кнопка будет добавлена в UI через React
          setTimeout(() => {
            setGameStarted(false);
          }, 2000);
        }
      }

      // Продолжаем игровой цикл
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Запуск игры
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleClick as unknown as EventListener);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
      gameEngineRef.current = null;
    };
  }, [gameStarted]);

  // Обработчик для начала игры
  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div className={styles.gameContainer}>
      {!gameStarted ? (
        <div className={styles.startScreen}>
          <h1>Telegram Runner</h1>
          <button
            className={styles.startButton}
            onClick={handleStartGame}
          >
            Начать игру
          </button>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className={styles.gameCanvas}
        />
      )}
    </div>
  );
};

export default Game;