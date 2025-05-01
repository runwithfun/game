export enum ObstacleType {
  BARRIER = 'BARRIER',
  COIN = 'COIN'
}

export enum BarrierVariant {
  HURDLE,     // Барьер для прыжков
  MANHOLE,    // Открытый люк
  ROAD_SIGN,  // Знак дорожных работ
  CONE,       // Дорожный конус
  PUDDLE      // Лужа
}

export class Obstacle {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private lane: number; // 0, 1, 2 для трех дорожек
  private speed: number;
  private type: ObstacleType;
  private barrierVariant: BarrierVariant;
  private emoji: string;
  private rotation: number;
  private fontSize: number;

  constructor(lane: number, y: number, laneWidth: number, type: ObstacleType, speed: number) {
    this.lane = lane;
    console.log(`Creating obstacle in lane ${this.lane}`);
    this.y = y;
    this.speed = speed;
    this.type = type;
    this.rotation = (Math.random() - 0.5) * 0.2; // Небольшой случайный наклон для всех эмодзи

    // Рассчитываем позицию по x на основе дорожки
    this.x = (lane + 0.5) * laneWidth;

    if (type === ObstacleType.COIN) {
      // Для монет
      this.fontSize = 40; // Размер шрифта для эмодзи монеты
      this.emoji = ''; // Не используем эмодзи для монет
      this.barrierVariant = BarrierVariant.HURDLE; // Не используется
      // Увеличиваем размер для столкновений
      this.width = 50;
      this.height = 50;
    } else {
      // Для препятствий разных типов
      this.fontSize = 50; // Размер по умолчанию
      // Увеличиваем размер для столкновений
      this.width = 60;
      this.height = 60;

      // Случайно выбираем вариант препятствия
      this.barrierVariant = Math.floor(Math.random() * 5);

      // Выбираем эмодзи и настраиваем размеры в зависимости от типа препятствия
      switch (this.barrierVariant) {
        case BarrierVariant.HURDLE:
          this.emoji = '🚧'; // Барьер
          this.fontSize = 45;
          break;
        case BarrierVariant.MANHOLE:
          this.emoji = '🥅'; // Заменяем "дыру" на "ворота"
          this.fontSize = 45;
          break;
        case BarrierVariant.ROAD_SIGN:
          this.emoji = '🚗'; // Заменяем "знак" на "машину"
          this.fontSize = 40;
          break;
        case BarrierVariant.CONE:
          this.emoji = '💣'; // Заменяем "конус" на "бомбу"
          this.fontSize = 35;
          break;
        case BarrierVariant.PUDDLE:
          this.emoji = '🛒'; // Заменяем "лужу" на "тележку для покупок"
          this.fontSize = 45;
          break;
      }
    }
  }

  // Обновление состояния препятствия
  update(deltaTime: number, gameSpeed: number): void {
    // Движение препятствия вниз по экрану
    const speedFactor = 0.15 * (1 + (gameSpeed - 1) * 0.5);
    this.y += this.speed * deltaTime * gameSpeed * speedFactor;
  }

  // Отрисовка препятствия
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Увеличим размер шрифта для лучшей видимости
    const displayFontSize = this.fontSize * 1.5; // Увеличим размер в 1.5 раза

    // Применяем небольшое вращение для разнообразия
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === ObstacleType.COIN) {
      // Рисуем специальную монету вместо эмодзи
      this.drawCustomCoin(ctx);
    } else {
      // Используем более универсальный шрифтовой стек для поддержки эмодзи
      ctx.font = `${displayFontSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Рисуем эмодзи для препятствий
      ctx.fillText(this.emoji, 0, 0);

      // Добавляем обводку для препятствий для лучшей видимости
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeText(this.emoji, 0, 0);
    }

    ctx.restore();
  }

  // Новый метод для отрисовки кастомной монеты
  private drawCustomCoin(ctx: CanvasRenderingContext2D): void {
    const coinRadius = this.width / 2;

    // Создаем яркую заливку для монеты
    const coinGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coinRadius);
    coinGradient.addColorStop(0, '#FFD700'); // Золотой центр
    coinGradient.addColorStop(0.8, '#DAA520'); // Темно-золотой край
    coinGradient.addColorStop(1, '#B8860B'); // Еще темнее по краю

    // Рисуем основу монеты
    ctx.fillStyle = coinGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coinRadius, 0, Math.PI * 2);
    ctx.fill();

    // Добавляем светлый блик для объема
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(-coinRadius * 0.3, -coinRadius * 0.3, coinRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Добавляем обводку
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Добавляем текст P.R.O.
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P.R.O.', 0, 0);

    // Создаем светящийся эффект вокруг монеты
    const glow = ctx.createRadialGradient(0, 0, coinRadius, 0, 0, coinRadius * 2);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    glow.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.fillStyle = glow;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.beginPath();
    ctx.arc(0, 0, coinRadius * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Методы для проверки коллизий
  isOutOfScreen(screenHeight: number): boolean {
    return this.y > screenHeight + this.height;
  }

  getType(): ObstacleType {
    return this.type;
  }

  checkCollision(playerX: number, playerY: number, playerWidth: number, playerHeight: number): boolean {
    // Простая проверка коллизий по прямоугольникам
    return (
      this.x - this.width / 2 < playerX + playerWidth / 2 &&
      this.x + this.width / 2 > playerX - playerWidth / 2 &&
      this.y - this.height / 2 < playerY &&
      this.y + this.height / 2 > playerY - playerHeight
    );
  }

  getLane(): number {
    return this.lane;
  }
}