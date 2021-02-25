let slideIndex = 0;
const slider = document.querySelector('.slider');
const sliderItems = document.querySelector('.slider-wrapper');
const prev = document.querySelector('.slider-btn--prev');
const next = document.querySelector('.slider-btn--next');
const playersWrapper = document.querySelector('.playlist');
function slide(items, prev, next) {
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
    index = 0,
    allowShift = true;

  // Clone first and last slide

  items.appendChild(cloneFirst); //добавляем в конец клон первого слайда
  items.insertBefore(cloneLast, firstSlide); // добавлям в начало клон последнего слайда

  // Mouse events
  // items.addEventListener('mousedown', dragStart);
  items.onmousedown = dragStart;
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
    console.log(`posFinal= ${posFinal}, posInitial= ${posInitial}`);
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
    createPlayers(index + 1);
  }
}
createPlayers(0);
slide(sliderItems, prev, next);

//создаем плееры

function createPlayers(slideIndex) {
  document.querySelectorAll('audio').forEach((item) => item.remove()); //удаляем все плееры
  // удаляем все гуи плееры
  const players = playersWrapper.querySelectorAll('.playlist-item');
  players.forEach((item) => item.remove());

  // получаем звуки
  let sounds = sliderItems.querySelectorAll('.slider-slide')[slideIndex].dataset
    .sounds;
  if (!sounds) {
    return false;
  }

  const soundsArr = sounds.split(' ');
  soundsArr.forEach((element) => {
    // добавляем на страницу новые плееры
    const audio = document.createElement('audio');
    const src = `assets/sounds/${element}.mp3`;
    audio.src = src;
    audio.volume = 0.35;
    audio.dataset.sound = element;
    document.body.append(audio);
    // добавляем гуи плеры
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

  // const playersWrapper = document.querySelector('.playlist');

  playerLabel.append(playerInput);
  playerGui.append(playerButton);
  playerGui.append(playerLabel);

  return playerGui;
}

playersWrapper.addEventListener('click', (event) => {
  const snd = event.target.dataset.sound; // получаем атрибут саунд
  if (snd) {
    // console.log(snd);
    audioPlayers = document.querySelectorAll('audio');
    audioPlayers.forEach((item) => {
      if (item.dataset.sound === snd && !event.target.value) {
        // console.log(event.target.value);
        if (!event.target.classList.contains('playing')) {
          item.play();
          event.target.classList.toggle('playing');
        } else {
          item.pause();
          event.target.classList.toggle('playing');
        }
      }
      if (item.dataset.sound === snd && event.target.value) {

        item.volume = event.target.value / 100;
      }
    });
  }
});
