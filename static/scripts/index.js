function updateSlider(images) {
  const slide = document.getElementById("slide");
  const dotsContainer = document.querySelector(".dots");
  // slide.innerHTML=''; // Clear existing images
  // dotsContainer.innerHTML=''; // Clear existing dots

  const preloadPromises = [];

  images.forEach((url, index) => {
    const img = new Image();
    img.src = url;
    const preloadPromise = new Promise((resolve, reject) => {
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
    });

    preloadPromises.push(preloadPromise);

    const carouselImg = document.createElement("img");
    carouselImg.classList.add("attraction-img");
    carouselImg.src = url;
    slide.appendChild(carouselImg);

    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.dataset.index = index;
    dotsContainer.appendChild(dot);
  });

  Promise.all(preloadPromises)
    .then(() => {
      initializeSlider();
    })
    .catch((error) => {
      console.error("Error preloading images:", error);
      initializeSlider();
    });
}

function initializeSlider() {
  setTimeout(() => {
    let counter = 0;
    const items = document.querySelectorAll(".attraction-img");
    const itemsCount = items.length;
    const prevBtn = document.getElementById("btn-left");
    const nextBtn = document.getElementById("btn-right");
    const dots = document.querySelectorAll(".dot");
    const timer = 4000;
    let interval = setInterval(showNext, timer);

    const showCurrent = () => {
      const itemToShow = Math.abs(counter % itemsCount);
      items.forEach((el, index) => {
        el.classList.remove("show");
        dots[index].classList.remove("active");
      });
      items[itemToShow].classList.add("show");
      dots[itemToShow].classList.add("active");
    };

    function showNext() {
      counter++;
      showCurrent();
    }
    function showPrev() {
      counter--;
      showCurrent();
    }

    function showImage(index) {
      counter = index;
      showCurrent();
    }

    document
      .getElementById("slide")
      .addEventListener("mouseover", () => clearInterval(interval));
    document
      .getElementById("slide")
      .addEventListener(
        "mouseout",
        () => (interval = setInterval(showNext, timer))
      );
    nextBtn.addEventListener("click", showNext);
    prevBtn.addEventListener("click", showPrev);

    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        showImage(index);
      });
    });

    items[0].classList.add("show");
    dots[0].classList.add("active");
  }, 100);
}

const tem_images = [
  "https://t.kfs.io/upload_images/208325/IMG_0654_medium.jpeg",
  "https://t.kfs.io/upload_images/208106/GI_1200x630_medium.jpg",
  "https://t.kfs.io/upload_images/207432/__G_I-DLE_MAIN-POSTER-1200x630_medium.jpg",
];

updateSlider(tem_images);
