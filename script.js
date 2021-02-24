const slider = document.querySelector('.slider');
const sliderItems = document.querySelector('.slider-wrapper');
const prev = document.querySelector('.slider-btn--prev');
const next = document.querySelector('.slider-btn--next');

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
  }
}

slide(sliderItems, prev, next);
