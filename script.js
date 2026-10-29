
const visualizer = document.getElementById("visualizer");

const comparisonsDisplay = document.getElementById("comparisons");
const swapsDisplay = document.getElementById("swaps");
const passesDisplay = document.getElementById("passes");
const statusDisplay = document.getElementById("sortStatus");

const messageDisplay = document.getElementById("message");
const actionText = document.getElementById("actionText");
const leftValueDisplay = document.getElementById("leftValue");
const rightValueDisplay = document.getElementById("rightValue");

const startBtn = document.getElementById("startBtn");
const stepBtn = document.getElementById("stepBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const randomBtn = document.getElementById("randomBtn");
const applyBtn = document.getElementById("applyBtn");

const customArrayInput = document.getElementById("customArray");
const speedInput = document.getElementById("speed");
const speedLabel = document.getElementById("speedLabel");
const arrayLabel = document.getElementById("arrayLabel");

let originalArray = [8, 3, 6, 1, 7, 2, 5, 4];
let arr = [...originalArray];

let i = 0;
let j = 0;
let comparisons = 0;
let swaps = 0;
let passes = 0;

let isRunning = false;
let isSorted = false;
let isPaused = false;
let timer = null;
let busy = false;
let currentAction = "ready";

const speedOptions = {
  1: { delay: 1400, label: "Very slow" },
  2: { delay: 950, label: "Slow" },
  3: { delay: 600, label: "Normal" },
  4: { delay: 320, label: "Fast" },
  5: { delay: 130, label: "Very fast" }
};

function getDelay() {
  return speedOptions[speedInput.value].delay;
}

function updateSpeedLabel() {
  speedLabel.textContent = speedOptions[speedInput.value].label;
}

function updateStats() {
  comparisonsDisplay.textContent = comparisons;
  swapsDisplay.textContent = swaps;
  passesDisplay.textContent = passes;
}

function setStatus(text) {
  statusDisplay.textContent = text;
}

function showMessage(text) {
  messageDisplay.textContent = text;
  actionText.textContent = text;
}

function createMinion(value, index) {
  const item = document.createElement("div");
  item.className = "sort-item";
  item.dataset.index = index;

  const valueLabel = document.createElement("span");
  valueLabel.className = "sort-value";
  valueLabel.textContent = value;

  const minion = document.createElement("div");
  minion.className = "minion";
  minion.style.setProperty(
    "--bar-height",
    `${65 + (value / Math.max(...arr)) * 130}px`
  );

  const goggles = document.createElement("div");
  goggles.className = "goggles";

  const eye = document.createElement("div");
  eye.className = "eye";

  const pupil = document.createElement("div");
  pupil.className = "pupil";

  eye.appendChild(pupil);
  goggles.appendChild(eye);

  if (value % 2 === 0) {
    const secondEye = eye.cloneNode(true);
    goggles.appendChild(secondEye);
  }

  const mouth = document.createElement("div");
  mouth.className = "mouth";

  const overalls = document.createElement("div");
  overalls.className = "overalls";

  minion.append(goggles, mouth, overalls);
  item.append(valueLabel, minion);

  return item;
}

function renderArray(highlights = {}) {
  visualizer.innerHTML = "";

  const sortedFrom = highlights.sortedFrom ?? arr.length;

  arr.forEach((value, index) => {
    const item = createMinion(value, index);

    if (index >= sortedFrom) {
      item.classList.add("sorted");
    }

    if (highlights.left === index || highlights.right === index) {
      item.classList.add("comparing");
    }

    if (highlights.swapping === index || highlights.swapping === index - 1) {
      item.classList.add("swapping");
    }

    visualizer.appendChild(item);
  });

  arrayLabel.textContent = `${arr.length} MINIONS`;
}

function updateComparisonValues(left, right) {
  leftValueDisplay.textContent =
    left === undefined ? "—" : left;

  rightValueDisplay.textContent =
    right === undefined ? "—" : right;
}

function stopTimer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

function resetCounters() {
  comparisons = 0;
  swaps = 0;
  passes = 0;
  i = 0;
  j = 0;
}

function resetSorting(newArray = originalArray) {
  stopTimer();

  isRunning = false;
  isPaused = false;
  isSorted = false;
  busy = false;

  originalArray = [...newArray];
  arr = [...newArray];

  resetCounters();
  currentAction = "ready";

  renderArray();
  updateStats();
  updateComparisonValues();

  setStatus("Ready");
  showMessage("Ready to sort! Press Start Sorting.");

  startBtn.disabled = false;
  stepBtn.disabled = false;
  pauseBtn.textContent = "Ⅱ Pause";
}

function finishSorting() {
  stopTimer();

  isRunning = false;
  isPaused = false;
  isSorted = true;
  busy = false;

  renderArray({ sortedFrom: 0 });
  updateStats();

  setStatus("Sorted");
  showMessage(
    `Amazing! All ${arr.length} Minions are in order. ` +
    `${comparisons} comparisons and ${swaps} swaps completed.`
  );

  updateComparisonValues();

  startBtn.disabled = false;
  stepBtn.disabled = true;
  pauseBtn.textContent = "Ⅱ Pause";
}

function advanceOneStep() {
  if (isSorted || busy) {
    return;
  }

  if (arr.length < 2 || i >= arr.length - 1) {
    finishSorting();
    return;
  }

  if (j >= arr.length - i - 1) {
    passes++;
    i++;
    j = 0;
    updateStats();

    if (i >= arr.length - 1) {
      finishSorting();
      return;
    }
  }

  const left = arr[j];
  const right = arr[j + 1];

  comparisons++;
  currentAction = "comparing";

  renderArray({
    left: j,
    right: j + 1,
    sortedFrom: arr.length - i
  });

  updateComparisonValues(left, right);
  updateStats();

  if (left > right) {
    arr[j] = right;
    arr[j + 1] = left;
    swaps++;

    currentAction = "swapping";

    renderArray({
      swapping: j + 1,
      sortedFrom: arr.length - i
    });

    showMessage(
      `${left} is greater than ${right}, so swap them!`
    );
  } else {
    showMessage(
      `${left} is not greater than ${right}, so they stay in place.`
    );
  }

  j++;
  updateStats();

  if (j >= arr.length - i - 1) {
    passes++;
    updateStats();
    i++;
    j = 0;
  }

  if (i >= arr.length - 1) {
    finishSorting();
  }
}

function scheduleNextStep() {
  stopTimer();

  if (!isRunning || isPaused || isSorted) {
    return;
  }

  timer = setTimeout(() => {
    if (!isRunning || isPaused || isSorted) {
      return;
    }

    advanceOneStep();

    if (isRunning && !isPaused && !isSorted) {
      scheduleNextStep();
    }
  }, getDelay());
}

function startSorting() {
  if (isSorted) {
    resetSorting(originalArray);
  }

  if (isRunning && !isPaused) {
    return;
  }

  isRunning = true;
  isPaused = false;

  startBtn.disabled = true;
  stepBtn.disabled = true;
  pauseBtn.textContent = "Ⅱ Pause";

  setStatus("Sorting");
  showMessage("Let's go! Comparing neighboring Minions.");

  scheduleNextStep();
}

function pauseSorting() {
  if (!isRunning && !isPaused) {
    showMessage("Press Start Sorting to begin.");
    return;
  }

  if (!isPaused) {
    isPaused = true;
    isRunning = false;
    stopTimer();

    startBtn.disabled = false;
    stepBtn.disabled = false;
    pauseBtn.textContent = "▶ Resume";

    setStatus("Paused");
    showMessage("Sorting paused. Resume or advance one step.");
  } else {
    isPaused = false;
    isRunning = true;

    startBtn.disabled = true;
    stepBtn.disabled = true;
    pauseBtn.textContent = "Ⅱ Pause";

    setStatus("Sorting");
    scheduleNextStep();
  }
}

function nextStep() {
  if (isSorted || busy) {
    return;
  }

  stopTimer();
  isRunning = false;
  isPaused = true;

  startBtn.disabled = false;
  stepBtn.disabled = false;
  pauseBtn.textContent = "▶ Resume";

  setStatus("Step mode");
  advanceOneStep();
}

function generateRandomArray() {
  const count = 8;
  const values = [];

  while (values.length < count) {
    const value = Math.floor(Math.random() * 90) + 10;

    if (!values.includes(value)) {
      values.push(value);
    }
  }

  resetSorting(values);
}

function applyCustomArray() {
  const raw = customArrayInput.value.trim();

  if (!raw) {
    showMessage("Enter numbers separated by commas first.");
    return;
  }

  const values = raw.split(",").map(value => value.trim());

  if (
    values.length < 2 ||
    values.length > 12 ||
    values.some(value => value === "" || !/^-?\d+$/.test(value))
  ) {
    showMessage(
      "Please enter 2–12 whole numbers, separated by commas."
    );
    return;
  }

  const numbers = values.map(Number);

  if (numbers.some(value => !Number.isSafeInteger(value))) {
    showMessage("Please enter smaller whole numbers.");
    return;
  }

  resetSorting(numbers);
  showMessage("Your custom numbers are ready. Press Start Sorting!");
}

startBtn.addEventListener("click", startSorting);
stepBtn.addEventListener("click", nextStep);
pauseBtn.addEventListener("click", pauseSorting);

resetBtn.addEventListener("click", () => {
  resetSorting(originalArray);
});

randomBtn.addEventListener("click", generateRandomArray);
applyBtn.addEventListener("click", applyCustomArray);

speedInput.addEventListener("input", () => {
  updateSpeedLabel();

  if (isRunning && !isPaused) {
    scheduleNextStep();
  }
});

customArrayInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    applyCustomArray();
  }
});

updateSpeedLabel();
resetSorting();
