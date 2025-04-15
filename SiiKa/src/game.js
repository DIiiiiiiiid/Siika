// Game constants
const COIN_TYPES = 8; // Number of coin levels
const COIN_RADIUS = [25, 32, 38, 45, 58, 65, 72, 85]; // Radius for different coin levels
const COIN_COLORS = [
  "#919797", // Level 1 - Gray
  "#F2BE7B", // Level 2 - Orange
  "#A1B3BF", // Level 3 - Blue-gray
  "#7AE37D", // Level 4 - Green
  "#FCEB38", // Level 5 - Yellow
  "#2BC4D5", // Level 6 - Cyan
  "#C87BAF", // Level 7 - Purple
  "#F1DEC9", // Level 8 - Beige
];
const COIN_SCORES = [1, 3, 6, 10, 15, 21, 28, 36]; // Scores for different coin levels

// 品质文字映射
const QUALITY_TEXT = {
  1: "普通",
  2: "高级",
  3: "稀有",
  4: "无敌",
};

// Effect constants
const MERGE_EFFECT_DURATION = 600;
const MERGE_EFFECT_MAX_SIZE = 70;
const MERGE_EFFECT_COLOR = "rgba(255, 215, 0, 0.8)";

// Matter.js 模块
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const World = Matter.World;
const Composite = Matter.Composite;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;
const Common = Matter.Common;

// 游戏变量
let engine;
let render;
let runner;
let world;
let nextCoin;
let nextCoinType;
let dropPosition;
let canDropCoin = true;
let gameOver = false;
let gameVictory = false;
let score = 0;
let dropZone;
let boundaries = {};
let coins = [];
let wallThickness = 1;
let isDragging = false;
let lastDropTime = 0;
const GAME_OVER_DELAY = 3000;
let isInGameOverDelay = false;
let coinJustDropped = false;
const STATIC_VELOCITY_THRESHOLD = 0.1;
const BOUNDARY_TOLERANCE = 5;

// 存储图鉴数据
let collectionData = {
  collections: [
    {
      id: 1,
      name: "世界核平币",
      quality: 1,
      image: "assets/bestcoin/1.png",
      description: "8",
      unlocked: true,
    },
    {
      id: 2,
      name: "诺贝尔环保币",
      quality: 1,
      image: "assets/bestcoin/2.png",
      description: "9",
      unlocked: false,
    },
    {
      id: 3,
      name: "松鼠复活币",
      quality: 1,
      image: "assets/bestcoin/3.png",
      description: "10",
      unlocked: false,
    },
    {
      id: 4,
      name: "星际遨行币",
      quality: 1,
      image: "assets/bestcoin/4.png",
      description: "11",
      unlocked: false,
    },
    {
      id: 5,
      name: "灭霸响指币",
      quality: 2,
      image: "assets/bestcoin/5.png",
      description: "12",
      unlocked: false,
    },
    {
      id: 6,
      name: "扎克斯堡伯格币",
      quality: 2,
      image: "assets/bestcoin/6.png",
      description: "13",
      unlocked: false,
    },
    {
      id: 7,
      name: "青菜灭绝币",
      quality: 2,
      image: "assets/bestcoin/7.png",
      description: "14",
      unlocked: false,
    },
    {
      id: 8,
      name: "AI失业救济币",
      quality: 2,
      image: "assets/bestcoin/8.png",
      description: "15",
      unlocked: false,
    },
    {
      id: 9,
      name: "川普登月纪念币",
      quality: 3,
      image: "assets/bestcoin/9.png",
      description: "16",
      unlocked: false,
    },
    {
      id: 10,
      name: "反重力掘鞋币",
      quality: 3,
      image: "assets/bestcoin/10.png",
      description: "17",
      unlocked: false,
    },
    {
      id: 11,
      name: "彩虹独角兽币",
      quality: 3,
      image: "assets/bestcoin/11.png",
      description: "18",
      unlocked: false,
    },
    {
      id: 12,
      name: "梵高助听器众筹币",
      quality: 3,
      image: "assets/bestcoin/12.png",
      description: "19",
      unlocked: false,
    },
    {
      id: 13,
      name: "硅谷裁员功德币",
      quality: 4,
      image: "assets/bestcoin/13.png",
      description: "20",
      unlocked: false,
    },
    {
      id: 14,
      name: "火星韭菜币",
      quality: 4,
      image: "assets/bestcoin/14.png",
      description: "21",
      unlocked: false,
    },
    {
      id: 15,
      name: "霍格沃兹学费币",
      quality: 4,
      image: "assets/bestcoin/15.png",
      description: "22",
      unlocked: false,
    },
    {
      id: 16,
      name: "登月摄影棚参观币",
      quality: 4,
      image: "assets/bestcoin/16.png",
      description: "23",
      unlocked: false,
    },
  ],
  newUnlocks: new Set(), // 用于跟踪新解锁的图鉴
};

// 添加硬币图片资源
const COIN_IMAGES = [];
let loadedImages = 0;
const totalImages = 8;

// 音效对象
const clickSound = new Audio("assets/sound/button.mp3");
const togetSound = new Audio("assets/sound/toget.mp3");

// 设置音效音量
clickSound.volume = 0.7;

// 获取DOM元素
const gameContainer = document.getElementById("game-container");
const scoreElement = document.getElementById("score");
const gameOverElement = document.getElementById("game-over");
const finalScoreElement = document.getElementById("final-score");
const restartButton = document.getElementById("restart-btn");
const nextCoinPreview = document.getElementById("next-coin-preview");

// 初始化游戏
async function init() {
  console.log("Initializing game environment...");

  try {
    // 初始化图鉴系统
    await initCollectionSystem();

    // 初始化游戏
    await initGame();

    // 设置重启按钮的事件监听器
    const restartButton = document.getElementById("restart-btn");
    const victoryRestartButton = document.getElementById("victory-restart-btn");

    if (restartButton) {
      restartButton.addEventListener("click", restart);
    }

    if (victoryRestartButton) {
      victoryRestartButton.addEventListener("click", restart);
    }

    console.log("Game initialization complete!");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

// 加载硬币图片
function loadCoinImages() {
  for (let i = 1; i <= totalImages; i++) {
    const img = new Image();
    img.onload = function () {
      loadedImages++;
      if (loadedImages === totalImages) {
        console.log("All coin images loaded");
        init(); // 所有图片加载完成后初始化游戏
      }
    };
    img.onerror = function () {
      console.error(`Failed to load coin image ${i}`);
    };
    img.src = `assets/coins/coin (${i}).png`;
    COIN_IMAGES.push(img);
  }
}

// 初始化图鉴系统
async function initCollectionSystem() {
  console.log("开始初始化图鉴系统...");
  try {
    const savedData = localStorage.getItem("collectionData");
    console.log("从localStorage获取的图鉴数据:", savedData);

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      collectionData.collections = parsedData.collections;
      collectionData.newUnlocks = new Set(parsedData.newUnlocks || []);
      console.log("使用localStorage中的图鉴数据");

      // 如果有新解锁的图鉴，显示红点
      if (collectionData.newUnlocks.size > 0) {
        showCollectionDot();
      }
    } else {
      console.log("使用默认图鉴数据");
      saveCollectionData();
    }

    setupCollectionEventListeners();
    renderCollectionGrid();
    console.log("图鉴系统初始化完成");
  } catch (error) {
    console.error("图鉴系统初始化失败:", error);
  }
}

// 设置图鉴事件监听器
function setupCollectionEventListeners() {
  console.log("开始设置图鉴事件监听器...");
  const collectionBtn = document.getElementById("collection-btn");
  const collectionModal = document.getElementById("collection-modal");
  const closeCollection = document.getElementById("close-collection");
  const detailModal = document.getElementById("detail-modal");
  const closeDetail = document.getElementById("close-detail");

  if (!collectionBtn || !collectionModal) {
    console.error("找不到必要的DOM元素");
    return;
  }

  // 添加红点元素
  let dot = document.createElement("div");
  dot.className = "collection-btn-dot";
  collectionBtn.appendChild(dot);

  // 如果有新解锁的图鉴，显示红点
  if (collectionData.newUnlocks && collectionData.newUnlocks.size > 0) {
    dot.style.display = "block";
    console.log("显示红点：有新解锁的图鉴");
  }

  collectionBtn.addEventListener("click", (e) => {
    console.log("图鉴按钮被点击", e);
    e.preventDefault();
    e.stopPropagation();

    // 清除新解锁标记
    collectionData.newUnlocks.clear();
    // 隐藏红点
    const dot = collectionBtn.querySelector(".collection-btn-dot");
    if (dot) {
      dot.style.display = "none";
    }
    // 重新渲染图鉴网格以移除NEW标签
    renderCollectionGrid();

    collectionModal.style.display = "block";
    setTimeout(() => {
      collectionModal.classList.add("show");
    }, 10);
  });

  if (closeCollection) {
    closeCollection.addEventListener("click", (e) => {
      console.log("关闭图鉴按钮被点击", e);
      e.preventDefault();
      e.stopPropagation();
      collectionModal.classList.remove("show");
      setTimeout(() => {
        collectionModal.style.display = "none";
        console.log("图鉴模态框已隐藏");
      }, 300);
    });
  }

  if (closeDetail) {
    closeDetail.addEventListener("click", (e) => {
      console.log("关闭详情按钮被点击", e);
      e.preventDefault();
      e.stopPropagation();
      detailModal.classList.remove("show");
      setTimeout(() => {
        detailModal.style.display = "none";
        console.log("详情模态框已隐藏");
      }, 300);
    });
  }

  // 点击空白处关闭模态框
  window.addEventListener("click", (e) => {
    if (e.target === collectionModal) {
      console.log("点击了图鉴模态框空白处", e);
      collectionModal.classList.remove("show");
      setTimeout(() => {
        collectionModal.style.display = "none";
        console.log("图鉴模态框已隐藏");
      }, 300);
    }
    if (e.target === detailModal) {
      console.log("点击了详情模态框空白处", e);
      detailModal.classList.remove("show");
      setTimeout(() => {
        detailModal.style.display = "none";
        console.log("详情模态框已隐藏");
      }, 300);
    }
  });
  console.log("图鉴事件监听器设置完成");
}

// 渲染图鉴网格
function renderCollectionGrid() {
  console.log("开始渲染图鉴网格...");
  const grid = document.getElementById("collection-grid");
  if (!grid) {
    console.error("找不到图鉴网格元素");
    return;
  }

  grid.innerHTML = "";
  console.log("图鉴数据:", collectionData);
  console.log("新解锁的图鉴ID:", Array.from(collectionData.newUnlocks));

  collectionData.collections.forEach((item) => {
    console.log("渲染图鉴项:", item);
    const div = document.createElement("div");
    div.className = `collection-item quality-${item.quality} ${
      !item.unlocked ? "locked" : ""
    }`;
    div.style.position = "relative";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;

    div.appendChild(img);

    // 如果是新解锁的图鉴，添加NEW标签
    if (item.unlocked && collectionData.newUnlocks.has(item.id)) {
      console.log("添加NEW标签到图鉴:", item.id);
      const newLabel = document.createElement("div");
      newLabel.className = "collection-item-new";
      newLabel.textContent = "NEW";
      newLabel.style.display = "block"; // 强制显示
      div.appendChild(newLabel);
    }

    if (item.unlocked) {
      div.addEventListener("click", () => {
        console.log("点击已解锁的图鉴项:", item);
        showDetail(item);
      });
    }

    grid.appendChild(div);
  });
  console.log("图鉴网格渲染完成");
}

// 显示图鉴详情
function showDetail(item) {
  console.log("显示图鉴详情:", item);
  try {
    const detailModal = document.getElementById("detail-modal");
    const title = document.getElementById("detail-title");
    const image = document.getElementById("detail-image");
    const qualityElement = document.getElementById("detail-quality");
    const description = document.getElementById("detail-description");
    const detailHeader = document.querySelector(".detail-header");

    if (
      !detailModal ||
      !title ||
      !image ||
      !qualityElement ||
      !description ||
      !detailHeader
    ) {
      console.error("详情模态框元素未找到:", {
        detailModal: !!detailModal,
        title: !!title,
        image: !!image,
        qualityElement: !!qualityElement,
        description: !!description,
        detailHeader: !!detailHeader,
      });
      return;
    }

    // 设置标题
    title.textContent = item.name;

    // 设置标题栏背景颜色，与品质对应
    detailHeader.className = `detail-header detail-header-${item.quality}`;

    // 清除旧的光晕效果
    const oldGlow = document.querySelector(".quality-glow");
    if (oldGlow) {
      oldGlow.remove();
    }

    // 添加品质光晕
    const imageContainer = document.querySelector(".detail-image-container");
    const qualityGlow = document.createElement("div");
    qualityGlow.className = `quality-glow quality-glow-${item.quality}`;
    imageContainer.appendChild(qualityGlow);

    // 设置图片
    image.src = item.image;

    // 品质标签
    qualityElement.className = `quality-label quality-label-${item.quality}`;
    qualityElement.textContent = QUALITY_TEXT[item.quality];

    // 描述
    description.textContent = `描述：${item.description}`;

    // 显示详情弹窗并添加动画
    detailModal.style.display = "flex"; // 修改为flex以支持居中
    setTimeout(() => {
      detailModal.classList.add("show");
      console.log("详情模态框显示动画已添加");
    }, 10);

    // 播放点击音效
    clickSound.currentTime = 0;
    clickSound.play();
    console.log("详情模态框显示完成");
  } catch (error) {
    console.error("显示详情时出错:", error);
  }
}

// 保存图鉴数据到localStorage
function saveCollectionData() {
  const dataToSave = {
    collections: collectionData.collections,
    newUnlocks: Array.from(collectionData.newUnlocks),
  };
  localStorage.setItem("collectionData", JSON.stringify(dataToSave));
}

// 初始化游戏
async function initGame() {
  console.log("Initializing game...");

  // 加载硬币图片
  loadCoinImages();

  // 重置游戏状态
  score = 0;
  gameOver = false;
  gameVictory = false;
  coins = [];
  canDropCoin = true;
  isDragging = false;
  isInGameOverDelay = false;
  coinJustDropped = false;
  lastDropTime = 0;
  scoreElement.textContent = score;
  gameOverElement.style.display = "none";

  // 创建引擎
  engine = Engine.create({
    enableSleeping: true,
  });
  world = engine.world;

  // 设置引力
  engine.gravity.y = 1;

  // 检查并移除之前的canvas
  const oldCanvas = gameContainer.querySelector("canvas");
  if (oldCanvas) {
    console.log("Removing old canvas...");
    oldCanvas.remove();
  }

  // 创建渲染器
  const containerWidth = gameContainer.clientWidth;
  const containerHeight = gameContainer.clientHeight;

  console.log("Creating renderer with dimensions:", {
    width: containerWidth,
    height: containerHeight,
    pixelRatio: window.devicePixelRatio || 1,
  });

  // 监听Matter.js的渲染选项变化
  const originalRender = Render.create;
  Render.create = function (options) {
    console.log("Matter.js render options:", options);
    const render = originalRender.call(this, options);
    console.log("Matter.js render created with options:", render.options);
    return render;
  };

  render = Render.create({
    element: gameContainer,
    engine: engine,
    options: {
      width: containerWidth,
      height: containerHeight,
      wireframes: false,
      background: "transparent",
      wireframeBackground: "transparent",
      pixelRatio: window.devicePixelRatio || 1,
      hasBounds: false,
      showSleeping: false,
      showDebug: false,
      showBroadphase: false,
      showBounds: false,
      showVelocity: false,
      showCollisions: false,
      showAxes: false,
      showPositions: false,
      showAngleIndicator: false,
      showIds: false,
    },
  });

  // 确保渲染器的背景是透明的
  render.options.background = "transparent";
  render.options.wireframeBackground = "transparent";

  // 监听渲染器的状态变化
  let lastBackgroundColor = "transparent";
  let lastWireframes = false;
  Events.on(render, "beforeRender", () => {
    if (render.canvas) {
      // 只在背景色发生变化时输出警告
      const currentBgColor = render.canvas.style.backgroundColor;
      if (
        currentBgColor !== "transparent" &&
        currentBgColor !== lastBackgroundColor
      ) {
        console.warn("Canvas background color changed:", currentBgColor);
        lastBackgroundColor = currentBgColor;
      }

      // 只在wireframes状态发生变化时输出日志
      if (render.options.wireframes !== lastWireframes) {
        console.log("Renderer wireframes changed:", {
          wireframes: render.options.wireframes,
          background: render.options.background,
          wireframeBackground: render.options.wireframeBackground,
        });
        lastWireframes = render.options.wireframes;
      }
    }
  });

  // 设置canvas样式
  if (render.canvas) {
    console.log("Initial canvas style:", {
      backgroundColor: render.canvas.style.backgroundColor,
      opacity: render.canvas.style.opacity,
      zIndex: render.canvas.style.zIndex,
    });

    // 设置canvas样式
    Object.assign(render.canvas.style, {
      backgroundColor: "transparent",
      opacity: "1",
      zIndex: "0",
      pointerEvents: "auto",
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "none",
      backdropFilter: "none",
      webkitBackdropFilter: "none",
    });

    // 强制清除任何可能的背景
    render.canvas
      .getContext("2d")
      .clearRect(0, 0, render.canvas.width, render.canvas.height);

    console.log("Canvas style after setting:", {
      backgroundColor: render.canvas.style.backgroundColor,
      opacity: render.canvas.style.opacity,
      zIndex: render.canvas.style.zIndex,
      background: render.canvas.style.background,
    });
  } else {
    console.warn("Canvas not found when trying to set styles");
  }

  console.log("Render options before run:", render.options);
  Render.run(render);
  console.log("Renderer started.");

  // 只有在render存在且有afterRender事件时才移除
  if (render && render.events && render.events.afterRender) {
    Events.off(render, "afterRender");
  }

  // 添加新的afterRender监听器
  Events.on(render, "afterRender", () => {
    if (
      render.canvas &&
      render.canvas.style.backgroundColor !== "transparent"
    ) {
      console.warn(
        "Canvas background changed in afterRender:",
        render.canvas.style.backgroundColor
      );
      render.canvas.style.backgroundColor = "transparent";
      render.canvas.style.opacity = "1";
    }
  });

  // 创建游戏边界
  wallThickness = 1; // 边界厚度改为1

  // 计算实际的游戏区域和边界位置
  const gameWidth = containerWidth - wallThickness * 2;

  // 计算左右边界的精确位置，同步窗口边界
  const leftWallX = 30 + wallThickness / 2; // 距离左边界30px
  const rightWallX = containerWidth - 30 - wallThickness / 2; // 距离右边界30px

  console.log("边界参数:", {
    容器宽度: containerWidth,
    容器高度: containerHeight,
    游戏区域宽度: gameWidth,
    边界厚度: wallThickness,
    左边界位置: leftWallX,
    右边界位置: rightWallX,
  });

  // 左墙
  boundaries.leftWall = Bodies.rectangle(
    leftWallX,
    containerHeight / 2,
    10, // 将厚度改为10
    containerHeight,
    {
      isStatic: true,
      render: {
        fillStyle: "rgba(0, 0, 0, 0)", // 完全透明
        opacity: 0,
        lineWidth: 0,
      },
    }
  );

  // 右墙
  boundaries.rightWall = Bodies.rectangle(
    rightWallX,
    containerHeight / 2,
    10, // 将厚度改为10
    containerHeight,
    {
      isStatic: true,
      render: {
        fillStyle: "rgba(0, 0, 0, 0)", // 完全透明
        opacity: 0,
        lineWidth: 0,
      },
    }
  );

  // 底部
  boundaries.ground = Bodies.rectangle(
    containerWidth / 2,
    containerHeight - 15, // 调整位置以适应新的厚度
    containerWidth - 60 - wallThickness * 2, // 调整宽度以适应新的边界位置（左右各30px）
    40, // 将厚度改为40
    {
      isStatic: true,
      render: {
        fillStyle: "rgba(0, 0, 0, 0)", // 完全透明
        opacity: 0,
        lineWidth: 0,
      },
    }
  );

  // 顶部投放区域
  dropZone = {
    x: containerWidth / 2,
    y: containerHeight * 0.3, // 设置为窗口高度的30%处
    width: containerWidth - wallThickness * 2,
    height: 10,
  };

  // 创建顶部边界线
  const topLine = Bodies.rectangle(
    containerWidth / 2,
    dropZone.y + dropZone.height,
    dropZone.width,
    2,
    {
      isStatic: true,
      isSensor: true,
      render: {
        fillStyle: "rgba(0,0,0,0)", // 完全透明
        opacity: 0,
        lineWidth: 0,
      },
    }
  );

  // 将所有边界添加到世界
  World.add(world, [
    boundaries.leftWall,
    boundaries.rightWall,
    boundaries.ground,
    topLine,
  ]);
  console.log("Boundaries added to world.");

  // 创建第一个硬币
  createNextCoin();

  // 设置碰撞检测
  setupCollisionDetection();

  // 创建运行器
  runner = Runner.create();

  // 启动物理引擎（使用Runner代替Engine.run）
  Runner.run(runner, engine);
  console.log("Runner started.");

  // 添加事件监听器
  setupEventListeners();

  // 添加键盘监听器
  window.addEventListener("keydown", function (event) {
    // 检查按下的是否为"I"键（键码73）
    if (event.key === "i" || event.key === "I") {
      console.log("按下I键，显示失败界面");
      // 显示失败界面
      showGameOver();
    }
    // 检查按下的是否为"V"键
    else if (event.key === "v" || event.key === "V") {
      console.log("按下V键，显示胜利界面");
      // 显示胜利界面
      showVictoryUI();
    }
  });
}

// 设置事件监听器
function setupEventListeners() {
  console.log("Setting up event listeners...");
  // 移除之前的事件监听器（避免重复绑定）
  gameContainer.removeEventListener("mousemove", handlePointerMove);
  gameContainer.removeEventListener("touchmove", handlePointerMove);
  gameContainer.removeEventListener("mousedown", startDrag);
  gameContainer.removeEventListener("touchstart", startDrag);
  gameContainer.removeEventListener("mouseup", dropCoin);
  gameContainer.removeEventListener("touchend", dropCoin);
  gameContainer.removeEventListener("mouseleave", handleMouseLeave);
  restartButton.removeEventListener("click", restart);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeyPress);

  // 移动事件
  gameContainer.addEventListener("mousemove", handlePointerMove);
  gameContainer.addEventListener("touchmove", handlePointerMove, {
    passive: false,
  });

  // 按下事件（开始拖动）
  gameContainer.addEventListener("mousedown", startDrag);
  gameContainer.addEventListener("touchstart", startDrag, { passive: false });

  // 抬起事件（投放硬币）
  gameContainer.addEventListener("mouseup", dropCoin);
  gameContainer.addEventListener("touchend", dropCoin);

  // 离开游戏区域
  gameContainer.addEventListener("mouseleave", handleMouseLeave);

  // 重新开始按钮
  restartButton.addEventListener("click", restart);

  // 窗口大小变化
  window.addEventListener("resize", handleResize);

  // 添加键盘事件监听
  window.addEventListener("keydown", handleKeyPress);
  console.log("Event listeners set up.");
}

// 处理鼠标离开
function handleMouseLeave(e) {
  console.log("Mouse leave detected. isDragging:", isDragging);
  if (isDragging) {
    console.log("Dropping coin due to mouse leave.");
    dropCoin(e); // 传递事件对象
  }
}

// 开始拖动
function startDrag(e) {
  console.log("Drag start triggered.");
  if (gameOver || !canDropCoin || !nextCoin) {
    console.log(
      "Drag start ignored: gameOver || !canDropCoin || !nextCoin",
      gameOver,
      !canDropCoin,
      !nextCoin
    );
    return;
  }

  if (e.preventDefault) {
    e.preventDefault();
  }

  isDragging = true;
  console.log("Dragging started. isDragging:", isDragging);
}

// 处理指针移动
function handlePointerMove(e) {
  if (!isDragging) return; // 只有在拖动时才处理移动
  if (gameOver || !canDropCoin || !nextCoin) return;

  let clientX;

  if (e.type === "touchmove") {
    if (e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else {
      return; // 没有触摸点，不处理
    }
    e.preventDefault();
  } else {
    clientX = e.clientX;
  }

  // 获取鼠标相对于游戏容器的X坐标
  const rect = gameContainer.getBoundingClientRect();
  const relativeX = clientX - rect.left;

  // 限制在左右边界内
  if (
    nextCoin &&
    nextCoin.coinType !== undefined &&
    COIN_RADIUS[nextCoin.coinType]
  ) {
    const radius = COIN_RADIUS[nextCoin.coinType];
    // 使用与物理边界相同的位置限制
    const minX = 30 + wallThickness + radius; // 左边界位置 + 边界厚度 + 硬币半径
    const maxX = gameContainer.clientWidth - 30 - wallThickness - radius; // 右边界位置 - 边界厚度 - 硬币半径
    dropPosition = Math.max(minX, Math.min(maxX, relativeX));

    // 更新下一个硬币的位置
    Body.setPosition(nextCoin, {
      x: dropPosition,
      y: dropZone.y - radius - 30, // 与投放位置保持一致，向上30px
    });
  } else {
    console.warn(
      "handlePointerMove: nextCoin or its properties are invalid",
      nextCoin
    );
  }
}

// 处理窗口大小变化
function handleResize() {
  console.log("Window resize detected. Restarting game.");
  // 这里可以添加响应式调整的代码
  // 简单起见，现在直接重启游戏
  restart();
}

// 创建下一个要投放的硬币
function createNextCoin() {
  console.log("Creating next coin...");
  const containerWidth = gameContainer.clientWidth;
  dropPosition = containerWidth / 2;

  // 使用概率分布生成硬币
  const random = Math.random() * 100; // 生成0-100的随机数
  if (random < 38) {
    nextCoinType = 0; // 38% 概率生成第1级硬币
  } else if (random < 73) {
    nextCoinType = 1; // 35% 概率生成第2级硬币
  } else {
    nextCoinType = 2; // 27% 概率生成第3级硬币
  }

  const radius = COIN_RADIUS[nextCoinType];

  nextCoin = Bodies.circle(dropPosition, dropZone.y - radius - 30, radius, {
    restitution: 0.3,
    friction: 0.1,
    density: 0.001,
    coinType: nextCoinType,
    render: {
      sprite: {
        texture: COIN_IMAGES[nextCoinType].src,
        xScale: (radius * 2) / COIN_IMAGES[nextCoinType].width,
        yScale: (radius * 2) / COIN_IMAGES[nextCoinType].height,
      },
    },
    isStatic: true,
    label: "nextCoin",
    isNextCoin: true,
  });

  World.add(world, nextCoin);
  coins.push(nextCoin);
  console.log("Next coin created and added:", nextCoin);
}

// 投放硬币
function dropCoin(e) {
  // 先保存当前的 nextCoin 引用，因为后续会清除它
  const coinToDrop = nextCoin;

  console.log(
    `Drop coin triggered. isDragging: ${isDragging}, canDropCoin: ${canDropCoin}, coinToDrop: ${
      coinToDrop ? coinToDrop.id : "null"
    }`
  );

  // 基本检查：游戏是否结束，是否能投放，是否有待投放硬币
  if (gameOver || !canDropCoin || !coinToDrop) {
    console.log(
      `Drop coin ignored (initial check): gameOver=${gameOver}, canDropCoin=${canDropCoin}, coinToDrop=${!!coinToDrop}`
    );
    // 如果是因为 mouseleave 触发但 isDragging 已经是 false，也忽略
    if (e && e.type === "mouseleave" && !isDragging) {
      console.log("Drop coin ignored: mouseleave triggered but not dragging.");
    }
    isDragging = false; // 确保在任何忽略路径下都重置拖动状态
    return;
  }

  // 播放投放音效
  clickSound.currentTime = 0;
  clickSound.play();

  // 状态检查：只有当确实在拖动或者是由 mouseleave 触发时才继续
  if (!isDragging && e && e.type !== "mouseleave") {
    console.log("Drop coin ignored: Not dragging and not mouseleave event.");
    return;
  }

  // 关键检查：确保要投放的硬币确实是当前的静态预览硬币
  if (!coinToDrop.isStatic || coinToDrop.label !== "nextCoin") {
    console.warn(
      `Drop coin aborted: coinToDrop (${coinToDrop.id}) is invalid or not the static preview coin. isStatic=${coinToDrop.isStatic}, label=${coinToDrop.label}`
    );
    isDragging = false; // 重置拖动状态
    return;
  }

  if (e && e.preventDefault) {
    e.preventDefault();
  }

  console.log(`Proceeding to drop coin: ${coinToDrop.id}`);

  // *** 核心修复：立即清除 nextCoin 引用 ***
  nextCoin = null;
  canDropCoin = false; // 禁止投放
  isDragging = false; // 重置拖动
  coinJustDropped = true; // 标记硬币刚刚被投放

  console.log(
    `State after clearing: nextCoin=null, canDropCoin=${canDropCoin}, isDragging=${isDragging}`
  );

  // 将硬币变为动态
  console.log(`Setting coin ${coinToDrop.id} to dynamic.`);
  Body.setStatic(coinToDrop, false);
  // 使用正确的函数唤醒物体
  Body.set(coinToDrop, "isSleeping", false);
  console.log(`Coin ${coinToDrop.id} woken up.`);

  // 确保硬币属性正确
  coinToDrop.isNextCoin = false;
  coinToDrop.label = "coin";
  coinToDrop.justDropped = true; // 标记为刚刚投放

  console.log(`Coin ${coinToDrop.id} properties updated.`);

  // 记录投放时间
  lastDropTime = Date.now();
  isInGameOverDelay = true;

  // 延迟检查游戏结束状态
  setTimeout(() => {
    isInGameOverDelay = false;
    coinJustDropped = false;
    if (coinToDrop) {
      coinToDrop.justDropped = false; // 移除刚刚投放标记
    }
  }, GAME_OVER_DELAY);

  // 延迟后创建新硬币
  setTimeout(() => {
    console.log("Timeout: Checking if can create next coin...");
    // 检查游戏是否已结束
    if (!gameOver) {
      createNextCoin();
      canDropCoin = true; // 允许下一次投放
      console.log("New coin created. canDropCoin set to true.");
    } else {
      console.log("Timeout: Game is over, not creating next coin.");
    }
  }, 500);
}

// 创建硬币函数
function createCoin(x, y, coinType) {
  const radius = COIN_RADIUS[coinType];
  const coin = Bodies.circle(x, y, radius, {
    restitution: 0.3,
    friction: 0.1,
    density: 0.001,
    coinType: coinType,
    render: {
      sprite: {
        texture: COIN_IMAGES[coinType].src,
        xScale: (radius * 2) / COIN_IMAGES[coinType].width,
        yScale: (radius * 2) / COIN_IMAGES[coinType].height,
      },
    },
    label: "coin",
  });

  // 添加到硬币数组
  coins.push(coin);
  return coin;
}

// 解锁随机图鉴
function unlockRandomCollection() {
  // 获取所有未解锁的图鉴
  const lockedCollections = collectionData.collections.filter(
    (item) => !item.unlocked
  );

  let selectedItem;

  if (lockedCollections.length === 0) {
    console.log("所有图鉴已解锁，随机选择一个已解锁的图鉴");
    const randomIndex = Math.floor(
      Math.random() * collectionData.collections.length
    );
    selectedItem = collectionData.collections[randomIndex];
    selectedItem.isRepeat = true;
    console.log("重复获得图鉴:", selectedItem);
    return selectedItem;
  } else {
    const randomIndex = Math.floor(Math.random() * lockedCollections.length);
    selectedItem = lockedCollections[randomIndex];

    const itemToUnlock = collectionData.collections.find(
      (item) => item.id === selectedItem.id
    );
    if (itemToUnlock) {
      itemToUnlock.unlocked = true;
      // 添加到新解锁集合
      collectionData.newUnlocks.add(itemToUnlock.id);
      // 显示红点
      showCollectionDot();
      // 保存到localStorage
      saveCollectionData();
      // 更新显示
      renderCollectionGrid();
      itemToUnlock.isRepeat = false;
      console.log("解锁新图鉴:", itemToUnlock);
      return itemToUnlock;
    }
  }

  return null;
}

// 添加显示红点的函数
function showCollectionDot() {
  const collectionBtn = document.getElementById("collection-btn");
  if (!collectionBtn) return;

  // 确保红点元素存在
  let dot = collectionBtn.querySelector(".collection-btn-dot");
  if (!dot) {
    dot = document.createElement("div");
    dot.className = "collection-btn-dot";
    collectionBtn.appendChild(dot);
  }

  dot.style.display = "block";
}

// 设置碰撞检测
function setupCollisionDetection() {
  Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // 忽略与边界的碰撞
      if (
        !bodyA ||
        !bodyB ||
        bodyA === boundaries.leftWall ||
        bodyA === boundaries.rightWall ||
        bodyA === boundaries.ground ||
        bodyB === boundaries.leftWall ||
        bodyB === boundaries.rightWall ||
        bodyB === boundaries.ground
      ) {
        continue;
      }

      // 检查两个硬币是否相同类型
      if (
        bodyA.coinType !== undefined &&
        bodyB.coinType !== undefined &&
        bodyA.coinType === bodyB.coinType &&
        !bodyA.isStatic &&
        !bodyB.isStatic &&
        bodyA.label === "coin" &&
        bodyB.label === "coin"
      ) {
        // 确保两个硬币都不是正在合并的
        if (!bodyA.merging && !bodyB.merging) {
          // 播放合并音效
          togetSound.currentTime = 0;
          togetSound.play();

          // 标记为正在合并，防止多次合并
          bodyA.merging = true;
          bodyB.merging = true;
          console.log(`Merging coins: ${bodyA.id} and ${bodyB.id}`);

          // 检查是否达到胜利条件（两个最高等级硬币合并）
          if (bodyA.coinType === COIN_TYPES - 1) {
            console.log("Victory condition met!");
            // 不在这里解锁图鉴，将在endGame中统一处理
            endGame(true); // 传入true表示胜利
            return;
          }

          // 只有当硬币类型小于最大类型时才进行合并
          if (bodyA.coinType < COIN_TYPES - 1) {
            // 创建新的合并后的硬币
            const newCoinType = bodyA.coinType + 1;
            const newCoin = createCoin(
              (bodyA.position.x + bodyB.position.x) / 2,
              (bodyA.position.y + bodyB.position.y) / 2,
              newCoinType
            );

            // 添加到世界
            World.add(world, newCoin);

            // 更新分数
            updateScore(COIN_SCORES[newCoinType]);
            console.log(
              `Score updated: +${COIN_SCORES[newCoinType]}, total: ${score}`
            );

            // 创建合并特效
            createMergeEffect(
              (bodyA.position.x + bodyB.position.x) / 2,
              (bodyA.position.y + bodyB.position.y) / 2,
              newCoinType
            );

            // 移除旧的硬币
            World.remove(world, bodyA);
            World.remove(world, bodyB);
            coins = coins.filter((coin) => coin !== bodyA && coin !== bodyB);
          }
        }
      }
    }
  });

  // 定期检查游戏状态
  Events.on(engine, "afterUpdate", () => {
    // 只有不在投放延迟期内才检查游戏结束
    if (!isInGameOverDelay && !coinJustDropped) {
      checkGameOver();
    }
  });
}

// Update score
function updateScore(points) {
  score += points;
  scoreElement.textContent = score; // 只更新数字
}

// Check game over
function checkGameOver() {
  if (gameOver || isInGameOverDelay || coinJustDropped) return;

  // Check if any coin exceeds the top boundary line
  for (const coin of coins) {
    // Skip invalid, static, merging, preview, just dropped coins
    if (
      !coin || // Check if coin exists
      coin.isStatic ||
      coin.merging ||
      coin.label === "nextCoin" ||
      coin.isNextCoin ||
      coin.justDropped ||
      coin.sleeping // Skip sleeping coins
    ) {
      continue;
    }

    // Safely get radius
    const radius = COIN_RADIUS[coin.coinType];
    if (radius === undefined) {
      console.warn("checkGameOver: Invalid coinType for radius", coin);
      continue;
    }

    // Calculate coin top edge position
    const coinTop = coin.position.y - radius;

    // Only end game if coin is clearly above boundary and almost stationary
    if (coinTop < dropZone.y - BOUNDARY_TOLERANCE) {
      // Check if coin is almost stationary (only consider tiny movements)
      const vx = Math.abs(coin.velocity?.x || 0);
      const vy = Math.abs(coin.velocity?.y || 0);

      if (vx < STATIC_VELOCITY_THRESHOLD && vy < STATIC_VELOCITY_THRESHOLD) {
        // Additional check: coin must stay in boundary area for a while
        if (!coin.stuckTime) {
          coin.stuckTime = Date.now();
          continue; // First detection, keep observing
        } else if (Date.now() - coin.stuckTime < 50) {
          // Reduced from 100ms to 50ms
          continue; // Not enough time, keep observing
        }

        // Final confirmation of game over
        console.log("Game over detected: Coin above boundary", coin);
        console.log(
          "Position:",
          coinTop,
          "Boundary:",
          dropZone.y,
          "Difference:",
          dropZone.y - coinTop
        );
        console.log("Velocity:", vx, vy);

        endGame();
        return;
      } else {
        // Coin is moving, reset stuck time
        coin.stuckTime = null;
      }
    } else {
      // Not in boundary area, reset stuck time
      coin.stuckTime = null;
    }
  }
}

// End game
function endGame(isVictory = false) {
  if (gameOver || gameVictory) return; // 防止多次调用

  if (isVictory) {
    gameVictory = true;
    gameOver = true;
    canDropCoin = false;

    // 显示胜利界面
    const victoryUI = document.getElementById("victory-ui");
    if (victoryUI) {
      document.getElementById("victory-score").textContent = score;
      victoryUI.style.display = "flex";
      victoryUI.style.flexDirection = "column";
      victoryUI.style.alignItems = "center";
      setTimeout(() => {
        victoryUI.classList.add("show");
      }, 50);
    }

    // 尝试解锁图鉴
    const unlockedItem = unlockRandomCollection();
    if (unlockedItem) {
      // 更新旧的文本信息（保留但隐藏）
      const unlockMessage = document.getElementById("unlock-message");
      if (unlockMessage) {
        unlockMessage.textContent = `解锁：${unlockedItem.name}`;
      }

      // 使用新的图鉴展示方式
      displayUnlockedCollection(unlockedItem);

      // 播放解锁音效
      togetSound.currentTime = 0;
      togetSound.play();
    }
  } else {
    gameOver = true;
    canDropCoin = false;

    // 显示失败界面
    const gameOverElement = document.getElementById("game-over");
    if (gameOverElement) {
      document.getElementById("final-score").textContent = score;
      gameOverElement.style.display = "block";
      setTimeout(() => {
        gameOverElement.classList.add("show");
      }, 50);
    }
  }

  console.log(
    isVictory ? "Game victory!" : "Game over!",
    "Final score:",
    score
  );

  // 停止运行器
  if (runner) {
    Runner.stop(runner);
  }
}

// 显示解锁的图鉴项
function displayUnlockedCollection(item) {
  const unlockImage = document.getElementById("unlock-image");
  const unlockName = document.getElementById("unlock-name");
  const unlockQuality = document.getElementById("unlock-quality");
  const unlockGlow = document.getElementById("unlock-glow");
  const unlockParticles = document.getElementById("unlock-particles");

  if (unlockImage && unlockName && unlockQuality && unlockGlow) {
    // 设置图片
    unlockImage.src = item.image;

    // 设置名称
    unlockName.textContent = item.name;

    // 设置品质文本和样式
    unlockQuality.textContent = QUALITY_TEXT[item.quality];
    unlockQuality.className = `unlock-quality quality-text-${item.quality}`;

    // 设置光晕颜色
    unlockGlow.className = `unlock-glow quality-glow-${item.quality}`;

    // 创建粒子效果
    if (unlockParticles) {
      createUnlockParticles(unlockParticles, item.quality);
    }

    console.log("展示解锁图鉴:", item);
  } else {
    console.error("未找到解锁图鉴展示元素");
  }
}

// 创建解锁粒子效果
function createUnlockParticles(container, quality) {
  // 清空之前的粒子
  container.innerHTML = "";

  // 如果胜利界面已隐藏，则不创建粒子
  const victoryUI = document.getElementById("victory-ui");
  if (
    !victoryUI ||
    victoryUI.style.display === "none" ||
    !victoryUI.classList.contains("show")
  ) {
    return;
  }

  // 根据品质选择粒子颜色
  let colors;
  switch (quality) {
    case 1:
      colors = ["#d3d3d3", "#c0c0c0", "#a9a9a9", "#808080"];
      break;
    case 2:
      colors = ["#87cefa", "#4da6ff", "#1e90ff", "#0000ff"];
      break;
    case 3:
      colors = ["#da70d6", "#9370db", "#8a2be2", "#9400d3"];
      break;
    case 4:
      colors = ["#ffd700", "#ffa500", "#ff8c00", "#ffff00"];
      break;
    default:
      colors = ["#ffffff", "#f0f0f0", "#e0e0e0", "#d0d0d0"];
  }

  // 创建粒子
  const particleCount = 20 + quality * 10; // 品质越高粒子越多

  // 创建一个递增的动画ID
  window.unlockParticleTimerId = window.unlockParticleTimerId || 0;
  const currentTimerId = ++window.unlockParticleTimerId;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // 随机颜色
    const colorIndex = Math.floor(Math.random() * colors.length);
    particle.style.background = colors[colorIndex];

    // 随机大小
    const size = 3 + Math.random() * 6;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // 随机位置和飞行轨迹
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 70;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    // 设置CSS变量用于动画
    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);

    // 随机动画延迟
    const delay = Math.random() * 0.5;
    particle.style.animationDelay = `${delay}s`;

    // 初始位置（中心）
    particle.style.left = "50%";
    particle.style.top = "50%";
    particle.style.transform = "translate(-50%, -50%)";

    // 添加到容器
    container.appendChild(particle);
  }

  // 延迟后重新创建粒子效果（循环）
  setTimeout(() => {
    // 检查当前定时器ID是否为最新的，以及界面是否仍然显示
    if (window.unlockParticleTimerId === currentTimerId) {
      createUnlockParticles(container, quality);
    }
  }, 2000);
}

// 重新开始游戏
function restart() {
  console.log("Restarting game...");

  // 重置粒子动画定时器
  window.unlockParticleTimerId = 0;

  // 重置界面状态
  const gameOverElement = document.getElementById("game-over");
  const victoryUI = document.getElementById("victory-ui");
  if (gameOverElement) {
    gameOverElement.style.display = "none";
    gameOverElement.classList.remove("show");
  }
  if (victoryUI) {
    victoryUI.style.display = "none";
    victoryUI.classList.remove("show");
  }

  // 清除粒子容器
  const unlockParticles = document.getElementById("unlock-particles");
  if (unlockParticles) {
    unlockParticles.innerHTML = "";
  }

  // 停止运行器
  if (runner) {
    Runner.stop(runner);
    runner = null;
  }

  // 清理事件监听器
  Events.off(engine, "collisionStart");
  Events.off(engine, "afterUpdate");
  if (render) {
    Events.off(render, "afterRender");
  }

  // 移除所有物体
  if (world) {
    World.clear(world);
  }
  if (engine) {
    Engine.clear(engine);
  }
  if (render) {
    Render.stop(render);
    if (render.canvas) {
      render.canvas.remove();
    }
    render = null;
  }

  // 移除DOM事件监听器
  gameContainer.removeEventListener("mousemove", handlePointerMove);
  gameContainer.removeEventListener("touchmove", handlePointerMove);
  gameContainer.removeEventListener("mousedown", startDrag);
  gameContainer.removeEventListener("touchstart", startDrag);
  gameContainer.removeEventListener("mouseup", dropCoin);
  gameContainer.removeEventListener("touchend", dropCoin);
  gameContainer.removeEventListener("mouseleave", handleMouseLeave);
  window.removeEventListener("resize", handleResize);

  // 重置全局变量
  engine = null;
  world = null;
  nextCoin = null;
  runner = null;
  coins = [];
  gameOver = false;
  gameVictory = false;
  score = 0;
  scoreElement.textContent = "0";

  // 重新初始化游戏
  init();
}

// 添加闪光特效函数
function createMergeEffect(x, y, coinType) {
  console.log("Creating merge effect at:", { x, y, coinType });

  // 根据硬币等级计算特效大小
  const baseSize = 50; // 保持这个大小
  const sizeMultiplier = 1 + coinType * 0.2; // 每升一级增加20%的大小
  const effectSize = baseSize * sizeMultiplier;

  // 获取对应等级的颜色
  const effectColor = COIN_COLORS[coinType];
  const particleColor = effectColor;

  // 创建主要闪光效果
  const effect = document.createElement("div");
  effect.className = "merge-effect";
  effect.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    transform: translate(-50%, -50%);
    z-index: 1000;
    width: ${effectSize}px;
    height: ${effectSize}px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.8) 0%,
      ${effectColor}80 30%,
      ${effectColor}40 60%,
      ${effectColor}00 100%
    );
    box-shadow: 0 0 30px ${effectColor}80;
    animation: mergeEffect ${MERGE_EFFECT_DURATION}ms ease-out forwards;
  `;

  gameContainer.appendChild(effect);
  console.log("Main effect element created and added to container");

  // 创建额外的粒子效果
  const particleCount = 8 + coinType * 2; // 根据等级增加粒子数量
  const particleSize = 3 + coinType; // 保持这个大小
  const particleDistance = 10 + coinType * 2.5;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    const angle = (i * Math.PI * 2) / particleCount;
    particle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%);
      width: ${particleSize}px;
      height: ${particleSize}px;
      background: ${particleColor};
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 0 10px ${particleColor};
      animation: particleEffect ${MERGE_EFFECT_DURATION}ms ease-out forwards;
    `;
    gameContainer.appendChild(particle);

    // 为每个粒子设置随机动画
    const scale = 1 + Math.random() * 0.5;
    const finalX = Math.cos(angle) * particleDistance * 2;
    const finalY = Math.sin(angle) * particleDistance * 2;
    particle.animate(
      [
        {
          transform: `translate(-50%, -50%) scale(1)`,
          opacity: 0.8,
        },
        {
          transform: `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px)) scale(${scale})`,
          opacity: 0,
        },
      ],
      {
        duration: MERGE_EFFECT_DURATION,
        easing: "ease-out",
        fill: "forwards",
      }
    );

    // 动画结束后移除粒子
    setTimeout(() => {
      if (particle && particle.parentNode) {
        particle.remove();
      }
    }, MERGE_EFFECT_DURATION);
  }
  console.log("All particle effects created and added");

  // 动画结束后移除主特效
  setTimeout(() => {
    if (effect && effect.parentNode) {
      effect.remove();
    }
  }, MERGE_EFFECT_DURATION);
}

// 添加键盘事件处理函数
function handleKeyPress(e) {
  if (e.key.toLowerCase() === "u" && !gameOver && canDropCoin) {
    console.log("U键被按下，创建第7级硬币");
    // 清除当前的nextCoin
    if (nextCoin) {
      World.remove(world, nextCoin);
      coins = coins.filter((coin) => coin.id !== nextCoin.id);
    }

    // 创建第7级硬币
    const containerWidth = gameContainer.clientWidth;
    dropPosition = containerWidth / 2;
    nextCoinType = 6; // 第7级（索引从0开始）
    const radius = COIN_RADIUS[nextCoinType];

    nextCoin = Bodies.circle(dropPosition, dropZone.y - radius - 30, radius, {
      restitution: 0.3,
      friction: 0.1,
      density: 0.001,
      coinType: nextCoinType,
      render: {
        sprite: {
          texture: COIN_IMAGES[nextCoinType].src,
          xScale: (radius * 2) / COIN_IMAGES[nextCoinType].width,
          yScale: (radius * 2) / COIN_IMAGES[nextCoinType].height,
        },
      },
      isStatic: true,
      label: "nextCoin",
      isNextCoin: true,
    });

    World.add(world, nextCoin);
    coins.push(nextCoin);
    console.log("第7级硬币创建完成");
  }
}

// 在页面加载完成后初始化游戏
document.addEventListener("DOMContentLoaded", () => {
  initGame();
});

function clearCollectionData() {
  localStorage.removeItem("collectionData");
  initCollectionSystem(); // 重新初始化图鉴系统，使用默认数据
  renderCollectionGrid(); // 重新渲染图鉴网格
}

// 立即执行清除操作
clearCollectionData();

// 显示游戏失败界面（仅用于预览）
function showGameOver() {
  // 获取游戏失败界面元素
  const gameOverElement = document.getElementById("game-over");
  if (gameOverElement) {
    // 设置最终得分（使用当前得分）
    document.getElementById("final-score").textContent = score;
    // 显示界面
    gameOverElement.style.display = "block";
    setTimeout(() => {
      gameOverElement.classList.add("show");
    }, 50);
  }
}

// 显示游戏胜利界面（仅用于预览）
function showVictoryUI() {
  // 获取游戏胜利界面元素
  const victoryUI = document.getElementById("victory-ui");
  if (victoryUI) {
    // 设置最终得分（使用当前得分）
    document.getElementById("victory-score").textContent = score;

    // 随机选择一个图鉴项进行展示（仅用于预览）
    const randomIndex = Math.floor(
      Math.random() * collectionData.collections.length
    );
    const previewItem = collectionData.collections[randomIndex];

    // 更新旧的文本显示（保留但隐藏）
    const unlockMessage = document.getElementById("unlock-message");
    if (unlockMessage) {
      unlockMessage.textContent = `解锁：${previewItem.name}`;
    }

    // 使用新的展示方式
    displayUnlockedCollection(previewItem);

    // 显示界面
    victoryUI.style.display = "flex";
    victoryUI.style.flexDirection = "column";
    victoryUI.style.alignItems = "center";

    setTimeout(() => {
      victoryUI.classList.add("show");
    }, 50);

    // 播放解锁音效
    togetSound.currentTime = 0;
    togetSound.play();
  }
}
