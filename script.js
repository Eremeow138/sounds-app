let slideIndex = localStorage.getItem('currentSlideIndex') || 1; //индекс слайда берем из локал сторейдж или 1
const sliderItems = document.querySelector('.slider-wrapper');
const prev = document.querySelector('.slider-btn--prev');
const next = document.querySelector('.slider-btn--next');
const playersWrapper = document.querySelector('.playlist');
const btnFullScreen = document.querySelector('.fullscreen');
const slides = sliderItems.querySelectorAll('.slider-slide');
// функция управления слайдером
function slide(items, prev, next, index) {
  // обертка слайдов, кнопка назад, кнопка вперед, индекс текущего слайда
  let posX1 = 0,
    posX2 = 0,
    posInitial,
    posInitialPX,
    posFinalPX,
    threshold = 100,
    // slides = items.querySelectorAll('.slider-slide'),
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
    const arr = items.style.left.split('');
    arr.pop();
    posInitial = +arr.join('');
    posInitialPX = items.offsetLeft; // posInitialPX - значение в пикселях требуется для работы перетаскивания

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
    posFinalPX = items.offsetLeft;
    if (posFinalPX - posInitialPX < -threshold) {
      shiftSlide(1, 'drag');
    } else if (posFinalPX - posInitialPX > threshold) {
      shiftSlide(-1, 'drag');
    } else {
      items.style.left = posInitial + '%';
    }
    document.onmouseup = null;
    document.onmousemove = null;
  }
  function shiftSlide(dir, action) {
    items.classList.add('shifting');

    if (allowShift) {
      if (!action) {
        const arr = items.style.left.split('');
        arr.pop();
        posInitial = +arr.join('');
      }

      if (dir == 1) {
        items.style.left = posInitial - 100 + '%';
        index++;
      } else if (dir == -1) {
        items.style.left = posInitial + 100 + '%';
        index--;
      }
    }

    allowShift = false;
  }

  function checkIndex() {
    items.classList.remove('shifting');

    if (index == -1) {
      items.style.left = -(slidesLength * 100) + '%';
      index = slidesLength - 1;
    }

    if (index == slidesLength) {
      items.style.left = -(1 * 100) + '%';
      index = 0;
    }

    allowShift = true;
    // после проверки индекса слайда:
    localStorage.setItem('currentSlideIndex', index + 1); // записываем индекс в локалсторейдж
    createPlayers(index + 1); // создаем плееры
    startPlayers(); // запускаем все плееры
    pauseAllVideo();
    startVideo(index);
  }
}
function pauseAllVideo() {
  slides.forEach((elem) => {
    elem.querySelector('video').pause();
  });
}
function startVideo(index) {
  const video = slides[index].querySelector('video');
  video.play();
}
// функция, которая устанавливает приоритет загрузки видео
function loadPriority(index) {
  const slidess = document
    .querySelector('.slider-wrapper')
    .querySelectorAll('.slider-slide');
  const video = slidess[index + 1].querySelector('video');

  video.preload = 'auto';
  let isVideoOneCanPlay = false;
  video.addEventListener('canplaythrough', (event) => {
    if (isVideoOneCanPlay) {
      return;
    }
    isVideoOneCanPlay = true;
    console.log(`video number ${index} loaded`);
    startVideo(index);

    let previousIndex;
    previousIndex = index - 1;

    let nextIndex;
    nextIndex = index + 1;

    const preveousVideo = slidess[previousIndex + 1].querySelector('video');
    const nextVideo = slidess[nextIndex + 1].querySelector('video');

    let isPrevVideoCanPlay = false;
    let isNextVideoCanPlay = false;

    preveousVideo.preload = 'auto';
    nextVideo.preload = 'auto';

    preveousVideo.addEventListener('canplaythrough', () => {
      if (isPrevVideoCanPlay) {
        return;
      }
      console.log(`video number ${previousIndex} loaded`);
      isPrevVideoCanPlay = true;
      loadAll(isPrevVideoCanPlay, isNextVideoCanPlay);
    });
    nextVideo.addEventListener('canplaythrough', () => {
      if (isNextVideoCanPlay) {
        return;
      }
      console.log(`video number ${nextIndex} loaded`);
      isNextVideoCanPlay = true;
      loadAll(isPrevVideoCanPlay, isNextVideoCanPlay);
    });
    //функция загружает все остальные видео
    function loadAll(prev, next) {
      if (prev && next) {
        console.log('loadAll');
        slidess.forEach(elem => {

          elem.querySelector('video').preload = 'auto';
        });
      };
    };
  });
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
  if (!sounds) {
    // если звуков нет - не добавляем ничего
    return false;
  }

  const soundsArr = sounds.split(' '); //делим строку звуков на отдельные звуки
  soundsArr.forEach((element) => {
    // добавляем на страницу новые плееры для каждого звука
    const audio = document.createElement('audio');
    const src = `assets/sounds/${element}.mp3`;
    audio.src = src;
    audio.volume = 0.25;
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
  playerLabel.textContent = name.replace(/-/g, ' ');

  const playerInput = document.createElement('input');
  playerInput.className = 'audio-volume';
  playerInput.name = 'volume';
  playerInput.dataset.sizing = '%';
  playerInput.dataset.sound = name;
  playerInput.type = 'range';
  playerInput.min = '0';
  playerInput.max = '100';
  playerInput.value = '25';

  playerLabel.append(playerInput);
  playerGui.append(playerButton);
  playerGui.append(playerLabel);

  return playerGui;
}
//добавляем слушатель клика на обертку наших плееров
playersWrapper.addEventListener('click', (event) => {
  const snd = event.target.dataset.sound; // получаем атрибут саунд у элемента по которому был клик
  if (snd) {
    // если атрибут sound существует, то
    audioPlayers = document.querySelectorAll('audio'); //получаем все плееры
    audioPlayers.forEach((item) => {
      // проходимся по каждому плееру
      if (item.dataset.sound === snd && !event.target.value) {
        // если у плеера атрибут саунд совпадает с атрибутом саунд у элемента управления и у элемента управления нет значения value (значит это кнопка)
        if (!event.target.classList.contains('playing')) {
          // если класса нет на кнопке, то стартуем плеер и добавляем класс
          item.play();
          event.target.classList.toggle('playing');
        } else {
          item.pause();
          event.target.classList.toggle('playing');
        }
      }
      if (item.dataset.sound === snd && event.target.value) {
        // если у плеера атрибут саунд совпадает с атрибутом саунд у элемента управления и у элемента управления есть значение value (значит это регулятор громкости)
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
// начало кода для работы с погодой
const weatherIcon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.weather-temperature');
const weatherDescription = document.querySelector('.weather-appearance');
const weatherForm = document.querySelector('.weather-form');
const weatherInput = weatherForm.querySelector('input');

async function getWeather() {
  if (!weatherInput.value) {
    return false;
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${weatherInput.value}&lang=en&appid=2c5ab2ada81f38ce038bf9d009c0b413&units=metric`;
  const res = await fetch(url);
  if (res.ok) {
    const data = await res.json();
    weatherIcon.className = 'weather-icon owf';
    weatherIcon.classList.add(`owf-${data.weather[0].id}`);
    temperature.textContent = `${data.main.temp}°C`;
    weatherDescription.textContent = data.weather[0].description;
  } else {
    if (res.status === 404) {
      temperature.textContent = '--';
      weatherDescription.textContent = `Sorry, the ${weatherInput.value} city is not found`;
    } else {
      temperature.textContent = '--';
      weatherDescription.textContent = `Response error: ${res.status}`;
    }
  }
}
function setCity(event) {
  event.preventDefault();
  localStorage.setItem('city', weatherInput.value);
  getWeather();
  weatherInput.blur();
}
document.addEventListener('DOMContentLoaded', getWeather);
weatherForm.addEventListener('submit', setCity);
// конец кода для работы с погодой

// startPlayers()
weatherInput.value = localStorage.getItem('city');
getWeather();
slide(sliderItems, prev, next, slideIndex - 1);
loadPriority(slideIndex - 1);
sliderItems.style.left = -100 * slideIndex + '%'; // перемещаем наш слайдер на нужный слайд при загрузке страницы
createPlayers(slideIndex); // создаем плееры для нужного слайда при загрузке страницы
