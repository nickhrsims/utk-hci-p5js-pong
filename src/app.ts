import { Game, GameConfig } from './game';

// -----------------------------
// Base Game Configuration
// -----------------------------

const baseConfig: GameConfig = {
  score: {
    textSize: 12,
    limit: 3,
  },
  paddles: {
    width: 4,
    gap: 64,
    speed: 0.25,
    controllers: [
      {
        height: 100,
        colliderCount: 1,
      }
    ]
  },
  goal: {
    width: 8,
    heightRatio: 1,
  },
  ball: {
    radius: 6,
    initialSpeed: 0.2,
    speedStep: 0.05,
    verticalEnglish: 0.05,
    activationDelay: 1200,
  },
  field: {
    width: 400,
    height: 400,
  },
  inputs: {     // Defaults Only
    p1: {
      up: 65,   // A
      down: 90, // Z
    },
    p2: {
      up: 75,   // K
      down: 77, // M
    }
  },
  debug: {
    goals: false,
    pointTime: true,
  },
};

// -----------------------------
// Theme Type Spec
// -----------------------------

type Theme = 'amber' | 'green' | 'black' | 'white';

// -----------------------------
// Optional Gameplay Mutations
// -----------------------------

enum BallSizeMutation {
  normal = 6,
  tiny = 2,
  large = 10,
  comical = 20,
}

enum PaddleSpeedMutation {
  normal = 0.25,
  fast = 0.4,
  cheat = 0.6,
}


type MutationConfig = {
  ballSize: BallSizeMutation;
  paddleSpeed: PaddleSpeedMutation;
}

// -----------------------------
// Application Control Class
// -----------------------------

export class App {

  private themeBackgroundLumosity: number = 0;

  private games: Game[];
  private gameIndex: number;
  private configs: Record<string, GameConfig>;
  private modeString: string;
  private mutationConfig: MutationConfig;

  constructor() {
    this.gameIndex = 0;
    this.configs = {
      pong: baseConfig,
      twoPaddle: {
        ...baseConfig,
        paddles: { ...baseConfig.paddles, controllers: [{ height: 100, colliderCount: 2 }] },
      },
      foosball: {
        ...baseConfig,
        paddles: {
          ...baseConfig.paddles, controllers: [{ height: 240, colliderCount: 3, }, { height: 120, colliderCount: 2 }]
        },
        goal: { width: 8, heightRatio: 4 },
        debug: { goals: true, pointTime: baseConfig.debug.pointTime }
      }
    }
    this.modeString = 'pong';
    this.mutationConfig = {
      ballSize: BallSizeMutation.normal,
      paddleSpeed: PaddleSpeedMutation.normal,
    }
    this.games = [Game.create(this.gameMode)];
  }

  /**
   * Aggregate all internal metrics and preset a JSON file for download containing them.
   */
  saveMetrics(filename: string): void {
    saveJSON(this.games.map((game: Game, index: number) => ({
      match: index + 1,
      points: game.aggregatePointRecords(),
      config: {
        ball: {
          radius: game.config.ball.radius,
          initialSpeed: game.config.ball.initialSpeed,
        },
        paddles: {
          speed: game.config.paddles.speed,
          perPlayerCount: game.config.paddles.controllers.map((controller) => controller.colliderCount).reduce((a, b) => a + b),
        }
      }
    })), filename);
  }


  get gameMode(): GameConfig {
    return this.configs[this.modeString];
  }

  changeGameMode(value: 'pong' | 'twoPaddle' | 'foosball'): void {
    this.modeString = value;
    this.newGame();
  }

  get game(): Game {
    return this.games[this.gameIndex];
  }

  newGame(): void {
    const config: GameConfig = {
      ...this.gameMode,
      ball: {
        ...this.gameMode.ball,
        radius: this.mutationConfig.ballSize.valueOf(),
      },
      paddles: {
        ...this.gameMode.paddles,
        speed: this.mutationConfig.paddleSpeed.valueOf(),
      }
    }
    this.gameIndex += 1;
    this.games[this.gameIndex] = Game.create(config);
  }

  changeBallSize(value: 'tiny' | 'normal' | 'large' | 'comical'): void {
    switch (value) {

    }
  }

  changeTheme(value: Theme): void {
    switch (value) {
      case 'amber':
        fill(255, 176, 0); // AMBER-CRT
        this.themeBackgroundLumosity = 0;
        break;
      case 'green':
        fill(51, 255, 0); // GREEN-CRT
        this.themeBackgroundLumosity = 0;
        break;
      case 'black':
        fill(0, 0, 0);
        this.themeBackgroundLumosity = 255;
        break;
      case 'white':
        fill(255, 255, 255);
        this.themeBackgroundLumosity = 0;
        break
    }
  }

  changeBallSizeMutation(value: BallSizeMutation): void {
    this.mutationConfig.ballSize = value;
    this.newGame();
  }

  changePaddleSpeedMutation(value: PaddleSpeedMutation): void {
    this.mutationConfig.paddleSpeed = value;
    this.newGame();
  }

  setup(): void {
    // Field Extraction
    const { game } = this;

    // Canvas settings
    createCanvas(this.gameMode.field.width, this.gameMode.field.height);
    textAlign(CENTER, CENTER);
    textSize(game.config.score.textSize);

    // Theme
    this.changeTheme('amber');

    // --- Control buttons
    // New Game / Save Metrics
    createButton("New Game").mouseClicked((): void => { this.newGame() });
    createButton("Save Metrics").mouseClicked((): void => { this.saveMetrics('metrics.json') });
    createP();
    // Game Mode
    createButton("Pong Mode").mouseClicked((): void => { this.changeGameMode('pong') });
    createButton("Two-Paddle Mode").mouseClicked((): void => { this.changeGameMode('twoPaddle') });
    createButton("Foosball Mode").mouseClicked((): void => { this.changeGameMode('foosball') });
    createP();

    // Ball Size Mutations
    createButton("Ball Size (Normal)").mouseClicked((): void => { this.changeBallSizeMutation(BallSizeMutation.normal) });
    createButton("Ball Size (Tiny)").mouseClicked((): void => { this.changeBallSizeMutation(BallSizeMutation.tiny) });
    createButton("Ball Size (Large)").mouseClicked((): void => { this.changeBallSizeMutation(BallSizeMutation.large) });
    createButton("Ball Size (Comical)").mouseClicked((): void => { this.changeBallSizeMutation(BallSizeMutation.comical) });
    createP();
    // Paddle Speed Mutations
    createButton("Paddle Speed (Normal)").mouseClicked((): void => { this.changePaddleSpeedMutation(PaddleSpeedMutation.normal) });
    createButton("Paddle Speed (Fast)").mouseClicked((): void => { this.changePaddleSpeedMutation(PaddleSpeedMutation.fast) });
    createButton("Paddle Speed (Cheat)").mouseClicked((): void => { this.changePaddleSpeedMutation(PaddleSpeedMutation.cheat) });
    createP();
    // Theme Settings
    createButton("Amber Theme").mouseClicked((): void => { this.changeTheme('amber') });
    createButton("Green Theme").mouseClicked((): void => { this.changeTheme('green') });
    createButton("Black Theme").mouseClicked((): void => { this.changeTheme('black') });
    createButton("White Theme").mouseClicked((): void => { this.changeTheme('white') });
  }

  draw(): void {
    background(this.themeBackgroundLumosity);
    this.game.process(deltaTime);
    this.game.drawDebug();
  }

}
