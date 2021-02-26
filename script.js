let slideIndex = localStorage.getItem('currentSlideIndex') || 1; //индекс слайда берем из локал сторейдж или 1
const sliderItems = document.querySelector('.slider-wrapper');
const prev = document.querySelector('.slider-btn--prev');
const next = document.querySelector('.slider-btn--next');
const playersWrapper = document.querySelector('.playlist');
const btnFullScreen = document.querySelector('.fullscreen');
// функция управления слайдером
function slide(items, prev, next, index) { // обертка слайдов, кнопка назад, кнопка вперед, индекс текущего слайда
  let posX1 = 0,
    posX2 = 0,
    posInitial,
    posFinal,
    threshold = 100,
    slides = items.querySelectorAll('.slider-slide'),
    slidesLength = slides.length,
    slideSize = slides[0].offsetWidth,
    firstSlide = slides[0],
    lastSlide = slides[slidesLength - 1],
    cloneFirst = firstSlide.cloneNode(true),
    cloneLast = lastSlide.cloneNode(true),
    allowShift = true;

  // Clone first and last slide

  items.appendChild(cloneFirst); //добавляем в конец клон первого слайда
  items.insertBefore(cloneLast, firstSlide); // добавлям в начало клон последнего слайда

  // Mouse events
  items.addEventListener('mousedown', dragStart);
  // Touch events
  items.addEventListener('touchstart', dragStart);
  items.addEventListener('touchend', dragEnd);
  items.addEventListener('touchmove', dragAction);

  // Click events
  prev.addEventListener('click', function () {
    shiftSlide(-1);
  });
  next.addEventListener('click', function () {
    shiftSlide(1);
  });

  // Transition events
  items.addEventListener('transitionend', checkIndex);

  function dragStart(e) {
    e = e || window.event;
    e.preventDefault();
    posInitial = items.offsetLeft;

    if (e.type == 'touchstart') {
      posX1 = e.touches[0].clientX;
    } else {
      posX1 = e.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }
  function dragAction(e) {
    e = e || window.event;

    if (e.type == 'touchmove') {
      posX2 = posX1 - e.touches[0].clientX;
      posX1 = e.touches[0].clientX;
    } else {
      posX2 = posX1 - e.clientX;
      posX1 = e.clientX;
    }
    items.style.left = items.offsetLeft - posX2 + 'px';
  }

  function dragEnd(e) {
    posFinal = items.offsetLeft;
    if (posFinal - posInitial < -threshold) {
      shiftSlide(1, 'drag');
    } else if (posFinal - posInitial > threshold) {
      shiftSlide(-1, 'drag');
    } else {
      items.style.left = posInitial + 'px';
    }
    document.onmouseup = null;
    document.onmousemove = null;
  }
  function shiftSlide(dir, action) {
    items.classList.add('shifting');

    if (allowShift) {
      if (!action) {
        posInitial = items.offsetLeft;
      }

      if (dir == 1) {
        items.style.left = posInitial - slideSize + 'px';
        index++;
      } else if (dir == -1) {
        items.style.left = posInitial + slideSize + 'px';
        index--;
      }
    }

    allowShift = false;
  }

  function checkIndex() {
    items.classList.remove('shifting');

    if (index == -1) {
      items.style.left = -(slidesLength * slideSize) + 'px';
      index = slidesLength - 1;
    }

    if (index == slidesLength) {
      items.style.left = -(1 * slideSize) + 'px';
      index = 0;
    }

    allowShift = true;
    // после проверки индекса слайда:
    localStorage.setItem('currentSlideIndex', index + 1); // записываем индекс в локалсторейдж
    createPlayers(index + 1);// создаем плееры
    startPlayers();// запускаем все плееры
  }
}
// функция для старта всех плееров (нужна при перелистывании тем)
function startPlayers() {
  // находим на странице плееры и их кнопки
  const players = document.querySelectorAll('audio');
  const playerButton = document.querySelectorAll('.audio-toggle');
  // запускаем плееры и вешаем класс на кнопки
  playerButton.forEach((item) => item.classList.add('playing'));
  players.forEach((item) => item.play());
}

//функция создания плееров
function createPlayers(slideIndex) {
  //удаляем все плееры
  const players = document.querySelectorAll('audio');
  players.forEach((item) => item.remove());
  // удаляем все элементы управления плеерами
  const playersButtons = playersWrapper.querySelectorAll('.playlist-item');
  playersButtons.forEach((item) => item.remove());

  // получаем звуки из атрибутов видео одной строкой
  let sounds = sliderItems.querySelectorAll('.slider-slide')[slideIndex].dataset
    .sounds;
  if (!sounds) {// если звуков нет - не добавляем ничего
    return false;
  }

  const soundsArr = sounds.split(' '); //делим строку звуков на отдельные звуки
  soundsArr.forEach((element) => {
    // добавляем на страницу новые плееры для каждого звука
    const audio = document.createElement('audio');
    const src = `assets/sounds/${element}.mp3`;
    audio.src = src;
    audio.volume = 0.35;
    audio.dataset.sound = element;
    audio.preload = true;
    audio.loop = true;
    document.body.append(audio);
    // добавляем элементы управления нашими плеерами
    playersWrapper.append(createGuiPlayer(element));
  });
}

function createGuiPlayer(name) {
  const playerGui = document.createElement('li');
  playerGui.className = 'playlist-item audio';

  const playerButton = document.createElement('button');
  playerButton.className = 'audio-toggle';
  playerButton.title = 'Turn on/off sound';
  playerButton.dataset.sound = name;

  const playerLabel = document.createElement('label');
  playerLabel.className = 'audio-inner';
  playerLabel.title = 'Volume';
  playerLabel.textContent = name;

  const playerInput = document.createElement('input');
  playerInput.className = 'audio-volume';
  playerInput.name = 'volume';
  playerInput.dataset.sizing = '%';
  playerInput.dataset.sound = name;
  playerInput.type = 'range';
  playerInput.min = '0';
  playerInput.max = '100';
  playerInput.value = '35';

  playerLabel.append(playerInput);
  playerGui.append(playerButton);
  playerGui.append(playerLabel);

  return playerGui;
}
//добавляем слушатель клика на обертку наших плееров
playersWrapper.addEventListener('click', (event) => {
  const snd = event.target.dataset.sound; // получаем атрибут саунд у элемента по которому был клик
  if (snd) {// если атрибут sound существует, то
    audioPlayers = document.querySelectorAll('audio');//получаем все плееры
    audioPlayers.forEach((item) => { // проходимся по каждому плееру
      if (item.dataset.sound === snd && !event.target.value) { // если у плеера атрибут саунд совпадает с атрибутом саунд у элемента управления и у элемента управления нет значения value (значит это кнопка)
        if (!event.target.classList.contains('playing')) { // если класса нет на кнопке, то стартуем плеер и добавляем класс
          item.play();
          event.target.classList.toggle('playing');
        } else {
          item.pause();
          event.target.classList.toggle('playing');
        }
      }
      if (item.dataset.sound === snd && event.target.value) { // если у плеера атрибут саунд совпадает с атрибутом саунд у элемента управления и у элемента управления есть значение value (значит это регулятор громкости)
        item.volume = event.target.value / 100; //указываем громкость плееру
      }
    });
  }
});
//начало кода для полноэкранного режима
btnFullScreen.addEventListener('click', (event) => {
  if (document.fullscreenElement !== null) {
    deactivateFullscreen(document.documentElement);
  } else {
    activateFullscreen(document.documentElement);
  }
});

function activateFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

// Whack fullscreen
function deactivateFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

document.addEventListener('fullscreenchange', (event) => {
  if (document.fullscreenElement) {
    btnFullScreen.classList.remove('openfullscreen');
    btnFullScreen.classList.add('exitfullscreen');
  } else {
    btnFullScreen.classList.remove('exitfullscreen');
    btnFullScreen.classList.add('openfullscreen');
  }
});
//конец кода для полноэкранного режима

// startPlayers()
slide(sliderItems, prev, next, slideIndex - 1);
sliderItems.style.left = -sliderItems.offsetWidth * slideIndex + 'px'; // перемещаем наш слайдер на нужный слайд при загрузке страницы
createPlayers(slideIndex); // создаем плееры для нужного слайда при загрузке страницы
