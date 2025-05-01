import { Player } from './Player';
import { Obstacle, ObstacleType } from './Obstacle';
import { Background } from './Background';

export class GameEngine {
  private player: Player;
  private obstacles: Obstacle[];
  private background: Background;
  private coins: number;
  private distance: number;
  private gameSpeed: number;
  private lastObstacleTime: number;
  private obstacleInterval: number;
  private isGameOver: boolean;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.player = new Player(width, height);
    this.obstacles = [];
    this.background = new Background(width, height);
    this.coins = 0;
    this.distance = 0;
    this.gameSpeed = 2;
    this.lastObstacleTime = 0;
    this.obstacleInterval = 2500;
    this.isGameOver = false;
  }

  // Обновление состояния игры
  update(deltaTime: number): void {
    if (this.isGameOver) return;

    // Обновить фон
    this.background.update(deltaTime);

    // Увеличиваем пройденную дистанцию
    this.distance += deltaTime * this.gameSpeed * 0.01;

    // Увеличиваем скорость игры со временем
    this.gameSpeed += deltaTime * 0.00003;

    // Уменьшаем интервал между препятствиями с увеличением скорости
    this.obstacleInterval = Math.max(1000, 2500 - this.gameSpeed * 100);

    // Обновляем игрока
    const laneWidth = this.canvasWidth / 3;
    this.player.update(deltaTime, laneWidth);

    // Создаем новые препятствия
    this.lastObstacleTime += deltaTime;
    if (this.lastObstacleTime > this.obstacleInterval) {
      this.lastObstacleTime = 0;
      this.spawnObstacle();
    }

    // Обновляем препятствия и проверяем коллизии
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update(deltaTime, this.gameSpeed);

      // Проверяем на коллизии с игроком
      if (obstacle.checkCollision(
        this.player.getX(),
        this.player.getY(),
        this.player.getWidth(),
        this.player.getHeight()
      )) {
        if (obstacle.getType() === ObstacleType.COIN) {
          // Собираем монету
          this.coins++;
          this.obstacles.splice(i, 1);
        } else {
          // Столкновение с препятствием - конец игры
          this.isGameOver = true;
        }
      } else if (obstacle.isOutOfScreen(this.canvasHeight)) {
        // Удаляем препятствия, вышедшие за пределы экрана
        this.obstacles.splice(i, 1);
      }
    }
  }

  // Отрисовка игры
  draw(ctx: CanvasRenderingContext2D): void {
    // Отрисовка фона вместо простого прямоугольника
    this.background.draw(ctx);

    // Отрисовка препятствий
    this.obstacles.forEach(obstacle => {
      obstacle.draw(ctx);
    });

    // Отрисовка игрока
    this.player.draw(ctx);

    // Отрисовка статистики
    this.drawStats(ctx);

    // Если игра окончена, показываем сообщение
    if (this.isGameOver) {
      this.drawGameOver(ctx);
    }
  }

  // Отрисовка статистики
  private drawStats(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Определяем размеры и отступы
    const cardWidth = 200;
    const cardHeight = 70;
    const cardMargin = 10;
    const cornerRadius = 15;

    // Задаем положение первой карточки
    let cardY = 20;

    // Отрисовка карточки с дистанцией
    this.drawStatsCard(
      ctx,
      cardMargin,
      cardY,
      cardWidth,
      cardHeight,
      cornerRadius,
      '🏃', // Иконка бегущего человека
      'Distance',
      `${Math.floor(this.distance)} km`,
      '#F8F8F8', // Белый фон
      '#F037A5'  // Фуксия для акцентов
    );

    cardY += cardHeight + 10;

    // Отрисовка карточки с монетами
    this.drawStatsCard(
      ctx,
      cardMargin,
      cardY,
      cardWidth,
      cardHeight,
      cornerRadius,
      '💰', // Иконка денег
      'P.R.O. coins',
      `${this.coins}`,
      '#F8F8F8',
      '#E6FE5F'  // Лимонный для акцентов
    );

    cardY += cardHeight + 10;

    // Отрисовка карточки со скоростью
    this.drawStatsCard(
      ctx,
      cardMargin,
      cardY,
      cardWidth,
      cardHeight,
      cornerRadius,
      '⚡', // Иконка молнии
      'Speed',
      `${this.gameSpeed.toFixed(1)}x`,
      '#F8F8F8',
      '#00C2FF'  // Голубой для акцентов
    );

    ctx.restore();
  }

  // Вспомогательный метод для рисования карточки статистики
  private drawStatsCard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    icon: string,
    label: string,
    value: string,
    bgColor: string,
    accentColor: string
  ): void {
    // Рисуем фон карточки с тенью
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    // Рисуем закругленный прямоугольник
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    // Убираем тень для текста
    ctx.shadowColor = 'transparent';

    // Рисуем иконку
    ctx.font = `${height * 0.5}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, x + height / 2, y + height / 2);

    // Рисуем название показателя
    ctx.font = '14px Arial';
    ctx.fillStyle = '#777';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + height + 5, y + height / 2 - 10);

    // Рисуем значение показателя
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(value, x + height + 5, y + height / 2 + 12);
  }

  // Отрисовка сообщения о конце игры
  private drawGameOver(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Полупрозрачный фон
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Рисуем карточку результатов
    const cardWidth = 300;
    const cardHeight = 350;
    const cardX = (this.canvasWidth - cardWidth) / 2;
    const cardY = (this.canvasHeight - cardHeight) / 2;
    const cornerRadius = 20;

    // Рисуем фон карточки с тенью
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // Рисуем закругленный прямоугольник
    ctx.fillStyle = '#F8F8F8';
    ctx.beginPath();
    ctx.moveTo(cardX + cornerRadius, cardY);
    ctx.lineTo(cardX + cardWidth - cornerRadius, cardY);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + cornerRadius);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - cornerRadius);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - cornerRadius, cardY + cardHeight);
    ctx.lineTo(cardX + cornerRadius, cardY + cardHeight);
    ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - cornerRadius);
    ctx.lineTo(cardX, cardY + cornerRadius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + cornerRadius, cardY);
    ctx.closePath();
    ctx.fill();

    // Убираем тень для текста
    ctx.shadowColor = 'transparent';

    // Заголовок
    ctx.fillStyle = '#F037A5';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', cardX + cardWidth / 2, cardY + 50);

    // Значок бега
    ctx.font = '60px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.fillText('🏃', cardX + cardWidth / 2, cardY + 110);

    // Дата и время
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    ctx.fillStyle = '#777';
    ctx.font = '16px Arial';
    ctx.fillText(`${dateString} at ${timeString}`, cardX + cardWidth / 2, cardY + 150);

    // Линия-разделитель
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 40, cardY + 180);
    ctx.lineTo(cardX + cardWidth - 40, cardY + 180);
    ctx.stroke();

    // Статистика
    // Дистанция
    const iconY = cardY + 220;
    ctx.font = '25px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.fillStyle = '#F037A5';
    ctx.textAlign = 'left';
    ctx.fillText('🏃', cardX + 50, iconY);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`${Math.floor(this.distance)} km`, cardX + 100, iconY);

    // Монеты
    const icon2Y = cardY + 260;
    ctx.fillStyle = '#E6FE5F';
    ctx.fillText('💰', cardX + 50, icon2Y);

    ctx.fillStyle = '#333';
    ctx.fillText(`${this.coins} P.R.O. coins`, cardX + 100, icon2Y);

    // Кнопка "Play Again"
    const btnY = cardY + 310;
    const btnWidth = 220;
    const btnHeight = 50;
    const btnX = cardX + (cardWidth - btnWidth) / 2;

    // Рисуем кнопку
    ctx.fillStyle = '#F037A5';
    ctx.beginPath();
    ctx.moveTo(btnX + cornerRadius, btnY);
    ctx.lineTo(btnX + btnWidth - cornerRadius, btnY);
    ctx.quadraticCurveTo(btnX + btnWidth, btnY, btnX + btnWidth, btnY + cornerRadius);
    ctx.lineTo(btnX + btnWidth, btnY + btnHeight - cornerRadius);
    ctx.quadraticCurveTo(btnX + btnWidth, btnY + btnHeight, btnX + btnWidth - cornerRadius, btnY + btnHeight);
    ctx.lineTo(btnX + cornerRadius, btnY + btnHeight);
    ctx.quadraticCurveTo(btnX, btnY + btnHeight, btnX, btnY + btnHeight - cornerRadius);
    ctx.lineTo(btnX, btnY + cornerRadius);
    ctx.quadraticCurveTo(btnX, btnY, btnX + cornerRadius, btnY);
    ctx.closePath();
    ctx.fill();

    // Текст кнопки
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PLAY AGAIN', btnX + btnWidth / 2, btnY + btnHeight / 2);

    ctx.restore();
  }

  // Создание нового препятствия
  private spawnObstacle(): void {
    const laneWidth = this.canvasWidth / 3;

    // С вероятностью 30% создаем препятствия сразу в двух дорожках
    const createTwoObstacles = Math.random() < 0.3;

    if (createTwoObstacles) {
      // Создаем препятствия в двух разных дорожках

      // Выбираем первую случайную дорожку
      const firstLane = Math.floor(Math.random() * 3);

      // Выбираем вторую дорожку, отличную от первой
      let secondLane;
      do {
        secondLane = Math.floor(Math.random() * 3);
      } while (secondLane === firstLane);

      // Создаем первое препятствие
      // Для первого препятствия у нас больше шансов получить барьер
      const firstType = Math.random() < 0.2 ? ObstacleType.COIN : ObstacleType.BARRIER;
      const firstObstacle = new Obstacle(firstLane, -50, laneWidth, firstType, 1);
      this.obstacles.push(firstObstacle);

      // Создаем второе препятствие
      // Для второго препятствия повышаем шанс монеты до 40%
      const secondType = Math.random() < 0.4 ? ObstacleType.COIN : ObstacleType.BARRIER;
      const secondObstacle = new Obstacle(secondLane, -50, laneWidth, secondType, 1);
      this.obstacles.push(secondObstacle);
    } else {
      // Стандартное поведение - создаем одно препятствие в случайной дорожке
      const lane = Math.floor(Math.random() * 3); // Случайная дорожка (0, 1 или 2)

      // Определяем тип объекта
      const type = Math.random() < 0.3 ? ObstacleType.COIN : ObstacleType.BARRIER;

      // Создаем препятствие в верхней части экрана
      const obstacle = new Obstacle(lane, -50, laneWidth, type, 1);
      this.obstacles.push(obstacle);
    }
  }

  // Управление игроком
  movePlayerLeft(): void {
    this.player.moveLeft();
  }

  movePlayerRight(): void {
    this.player.moveRight();
  }

  // Оставляем метод для совместимости, но он не будет вызываться из UI
  playerJump(): void {
    // this.player.jump(); - метод отключен, но сохранен для совместимости
  }

  // Получение статуса игры
  isOver(): boolean {
    return this.isGameOver;
  }

  // Перезапуск игры
  restart(): void {
    this.player = new Player(this.canvasWidth, this.canvasHeight);
    this.obstacles = [];
    this.coins = 0;
    this.distance = 0;
    this.gameSpeed = 2;
    this.lastObstacleTime = 0;
    this.obstacleInterval = 2500;
    this.isGameOver = false;
  }

  // Геттеры для доступа к статистике
  getCoins(): number {
    return this.coins;
  }

  getDistance(): number {
    return Math.floor(this.distance);
  }

  getSpeed(): number {
    return this.gameSpeed;
  }

  // Обновить размеры при изменении экрана
  updateDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.background.updateDimensions(width, height);
  }
}