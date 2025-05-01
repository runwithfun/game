export class Background {
  private canvasWidth: number;
  private canvasHeight: number;
  private bgColor: string;
  private gradientColor1: string;
  private gradientColor2: string;
  private dots: Array<{x: number, y: number, size: number, speed: number}>;

  constructor(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.bgColor = '#FFFFFF';
    this.gradientColor1 = '#E6FE5F'; // Citric
    this.gradientColor2 = '#F037A5'; // Fuchsia

    // Создаем декоративные точки для фона
    this.dots = [];
    this.generateDots();
  }

  // Генерирует декоративные точки для анимированного фона
  private generateDots(): void {
    const dotsCount = Math.floor(this.canvasWidth * this.canvasHeight / 15000);

    for (let i = 0; i < dotsCount; i++) {
      this.dots.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 1 + 0.5
      });
    }
  }

  // Обновить размеры канваса
  updateDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;

    // Перегенерировать точки
    this.dots = [];
    this.generateDots();
  }

  // Обновление анимации фона
  update(deltaTime: number): void {
    // Обновляем позиции точек для создания эффекта движения
    for (const dot of this.dots) {
      dot.y += dot.speed * (deltaTime / 16);

      // Возвращаем точку наверх, когда она выходит за пределы экрана
      if (dot.y > this.canvasHeight) {
        dot.y = -dot.size;
        dot.x = Math.random() * this.canvasWidth;
      }
    }
  }

  // Отрисовка фона
  draw(ctx: CanvasRenderingContext2D): void {
    // Базовый фон
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Рисуем дорожки с градиентом
    this.drawLanes(ctx);

    // Рисуем декоративные точки
    this.drawDots(ctx);
  }

  // Рисуем градиентные дорожки
  private drawLanes(ctx: CanvasRenderingContext2D): void {
    const laneWidth = this.canvasWidth / 3;

    // Создаем градиент для линий
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, this.gradientColor1);
    gradient.addColorStop(1, this.gradientColor2);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;

    // Рисуем линии с эффектом пунктира для создания эффекта движения
    ctx.setLineDash([15, 10]);

    // Первая линия
    ctx.beginPath();
    ctx.moveTo(laneWidth, 0);
    ctx.lineTo(laneWidth, this.canvasHeight);
    ctx.stroke();

    // Вторая линия
    ctx.beginPath();
    ctx.moveTo(laneWidth * 2, 0);
    ctx.lineTo(laneWidth * 2, this.canvasHeight);
    ctx.stroke();

    // Сбрасываем пунктир
    ctx.setLineDash([]);
  }

  // Рисуем декоративные точки
  private drawDots(ctx: CanvasRenderingContext2D): void {
    for (const dot of this.dots) {
      // Создаем градиент для точки
      const gradient = ctx.createRadialGradient(
        dot.x, dot.y, 0,
        dot.x, dot.y, dot.size
      );

      gradient.addColorStop(0, 'rgba(230, 254, 95, 0.8)');
      gradient.addColorStop(1, 'rgba(230, 254, 95, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}