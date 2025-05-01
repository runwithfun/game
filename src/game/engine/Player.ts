export class Player {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private lane: number; // 0, 1, 2 для трех дорожек
  private animationFrame: number;
  private animationTimer: number;
  private isMoving: boolean;
  private moveDirection: number; // -1: влево, 0: не движется, 1: вправо
  private lastLane: number;
  private isJumping: boolean;
  private jumpHeight: number;
  private jumpProgress: number;
  private color: string;

  constructor(width: number, height: number) {
    this.width = 40;
    this.height = 60;
    this.lane = 1; // Начинаем в средней дорожке
    this.lastLane = 1;
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.isMoving = false;
    this.moveDirection = 0;
    this.isJumping = false;
    this.jumpHeight = 100;
    this.jumpProgress = 0;
    this.color = '#F037A5'; // Fuchsia цвет

    // Рассчитываем начальную позицию
    this.x = width / 2;
    this.y = height - 100;
  }

  // Перемещение в левую дорожку
  moveLeft(): void {
    if (this.lane > 0) {
      this.lastLane = this.lane;
      this.lane--;
      this.isMoving = true;
      this.moveDirection = -1;
    }
  }

  // Перемещение в правую дорожку
  moveRight(): void {
    if (this.lane < 2) {
      this.lastLane = this.lane;
      this.lane++;
      this.isMoving = true;
      this.moveDirection = 1;
    }
  }

  // Начать прыжок
  jump(): void {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpProgress = 0;
    }
  }

  // Обновление состояния игрока
  update(deltaTime: number, laneWidth: number): void {
    // Обновление позиции x в зависимости от текущей дорожки
    const targetX = (this.lane + 0.5) * laneWidth;

    // Плавное перемещение между дорожками
    const dx = targetX - this.x;
    this.x += dx * 0.2;

    // Обновление анимации
    this.animationTimer += deltaTime;

    // Проверяем, двигается ли персонаж между дорожками
    this.isMoving = Math.abs(dx) > 1;

    // Обновляем направление движения, если перемещение почти завершено
    if (!this.isMoving) {
      this.moveDirection = 0;
    }

    // Меняем кадр анимации каждые 100мс для бега
    // Персонаж всегда "бежит", даже когда он на одной дорожке
    if (this.animationTimer > 100) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % 4;
    }

    // Обработка прыжка (если функция включена)
    if (this.isJumping) {
      this.jumpProgress += deltaTime * 0.003;

      if (this.jumpProgress >= 1) {
        this.isJumping = false;
        this.jumpProgress = 0;
      } else {
        // Параболическая функция для прыжка
        this.y -= Math.sin(this.jumpProgress * Math.PI) * this.jumpHeight;
      }
    }
  }

  // Отрисовка игрока
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Определяем масштаб (на более высоких скоростях анимация будет быстрее)
    const scale = 1;

    // Центр игрока
    const centerX = this.x;
    const centerY = this.y - this.height / 2;

    // Рисуем бегущего человека (вид сверху)
    this.drawRunningPerson(ctx, centerX, centerY, scale);

    ctx.restore();
  }

  // Функция для рисования бегущего человека (вид сверху)
  private drawRunningPerson(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
    // Основные цвета
    const headColor = '#F8D5B5'; // Цвет головы (телесный)
    const bodyColor = '#F037A5'; // Цвет одежды (фуксия)
    const limbColor = '#E6FE5F'; // Цвет рук/ног (лимонный)
    const headbandColor = '#E6FE5F'; // Цвет повязки (лимонный, как руки/ноги)

    // Размеры частей тела
    const headRadius = 12 * scale;
    const bodyWidth = 24 * scale;
    const bodyHeight = 36 * scale;
    const limbWidth = 6 * scale;

    // Персонаж всегда бежит, но движение более выражено, когда он перемещается между дорожками
    const moveFactor = this.isMoving ? 1 : 0.6; // 60% анимации, когда на месте

    // Определяем анимацию бега
    const cyclePhase = this.animationFrame / 4; // 0-1 цикл
    const limbOffset = Math.sin(cyclePhase * Math.PI * 2) * 8 * scale * moveFactor;

    // Добавляем небольшое вертикальное колебание для имитации бега
    const bounceOffset = Math.abs(Math.sin(cyclePhase * Math.PI * 2)) * 3 * scale * moveFactor;

    // Вращение персонажа в зависимости от направления движения
    let rotation = 0;
    if (this.moveDirection !== 0) {
      rotation = this.moveDirection * 0.1; // Наклон в сторону движения
    }

    // Применяем вращение относительно центра персонажа
    ctx.translate(x, y - bounceOffset); // Добавляем вертикальное колебание
    ctx.rotate(rotation);
    ctx.translate(-x, -(y - bounceOffset));

    // Рисуем тело (овал)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(x, y - bounceOffset, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Рисуем голову (круг)
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(x, y - bounceOffset - bodyHeight / 2 - headRadius / 2, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Рисуем тени на лице, чтобы создать направленность
    const faceDirection = this.moveDirection || 1; // Если не движется, смотрит вперед

    // Добавляем повязку вокруг головы (ниндзя-стиль)
    ctx.fillStyle = headbandColor;

    // Позиция центра головы
    const headCenterY = y - bounceOffset - bodyHeight / 2 - headRadius / 2;

    // Рисуем повязку как прямоугольник с закругленными концами
    ctx.beginPath();

    // Ширина и высота повязки
    const headbandHeight = headRadius * 0.4;
    const headbandWidth = headRadius * 2.5;

    // Рисуем повязку немного выше центра головы
    const headbandY = headCenterY - headRadius * 0.1;

    // Рисуем повязку с вращением вокруг головы
    ctx.save();
    ctx.translate(x, headbandY);
    ctx.rotate(0.1 * faceDirection); // Небольшой угол для динамичности

    // Рисуем основную часть повязки
    this.roundRect(
      ctx,
      -headbandWidth / 2,
      -headbandHeight / 2,
      headbandWidth,
      headbandHeight,
      headbandHeight / 2
    );

    // Добавляем концы повязки (развевающиеся)
    const endLength = headRadius * 0.8;
    const endWidth = headbandHeight * 0.8;

    // Рисуем развевающиеся концы повязки
    ctx.beginPath();
    ctx.moveTo(headbandWidth / 2 - endWidth / 2, 0);
    ctx.lineTo(headbandWidth / 2 + endLength, -endWidth);
    ctx.lineTo(headbandWidth / 2 + endLength, endWidth);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Рисуем руки
    ctx.fillStyle = limbColor;

    // Левая рука
    ctx.beginPath();
    ctx.ellipse(
      x - bodyWidth / 2 - limbWidth / 2,
      y - bounceOffset - limbOffset,
      limbWidth,
      limbWidth * 2,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // Правая рука
    ctx.beginPath();
    ctx.ellipse(
      x + bodyWidth / 2 + limbWidth / 2,
      y - bounceOffset + limbOffset,
      limbWidth,
      limbWidth * 2,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // Рисуем ноги
    // Левая нога
    ctx.beginPath();
    ctx.ellipse(
      x - bodyWidth / 4,
      y - bounceOffset + bodyHeight / 2 + limbOffset,
      limbWidth,
      limbWidth * 2,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // Правая нога
    ctx.beginPath();
    ctx.ellipse(
      x + bodyWidth / 4,
      y - bounceOffset + bodyHeight / 2 - limbOffset,
      limbWidth,
      limbWidth * 2,
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // Добавляем тень для объема
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + bodyHeight / 2 + limbWidth * 2 + 5 * scale,
      bodyWidth / 2 + 5 * scale,
      5 * scale,
      0, 0, Math.PI * 2
    );
    ctx.fill();
  }

  // Вспомогательный метод для рисования прямоугольника с закругленными углами
  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
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
  }

  // Геттеры для определения коллизий
  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}