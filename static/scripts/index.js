import {
  handleModal,
  handleSignOut,
  checkUserSignInStatus,
  handleForms,
} from "./userApi.js";

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
  "https://static.ticketplus.com.tw/event/f8704ca7ddebb0ba12000f5ff4f76a45/picBigActiveMain_1722854812562.jpeg",
  "https://t.kfs.io/upload_images/208325/IMG_0654_medium.jpeg",
  "https://t.kfs.io/upload_images/208106/GI_1200x630_medium.jpg",
  "https://www.legacy.com.tw/uploads/image_library/1469005927.jpg",
  "https://t.kfs.io/upload_images/207432/__G_I-DLE_MAIN-POSTER-1200x630_medium.jpg",
];

updateSlider(tem_images);

document.addEventListener("DOMContentLoaded", () => {
  const { signInForm, signUpForm, signInError, signUpError, signUpSuccess } =
    handleModal();
  handleForms({
    signInForm,
    signUpForm,
    signInError,
    signUpError,
    signUpSuccess,
  });
  // checkUserSignInStatus();
});

document.getElementById("show-all").addEventListener("click", function () {
  let events = document.querySelectorAll(".event-box");
  events.forEach(function (event) {
    event.classList.remove("inactive");
  });

  // Set active class for tab
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  this.classList.add("active");
});

document.getElementById("show-popular").addEventListener("click", function () {
  let events = document.querySelectorAll(".event-box");
  events.forEach(function (event) {
    if (event.classList.contains("popular")) {
      event.classList.remove("inactive");
    } else {
      event.classList.add("inactive");
    }
  });

  // Set active class for tab
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  this.classList.add("active");
});

document.getElementById("show-upcoming").addEventListener("click", function () {
  let events = document.querySelectorAll(".event-box");
  events.forEach(function (event) {
    if (event.classList.contains("upcoming")) {
      event.classList.remove("inactive");
    } else {
      event.classList.add("inactive");
    }
  });

  // Set active class for tab
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  this.classList.add("active");
});

const eventsContainer = document.querySelector(".events-container");
let nextPage = null;
let isFetching = false;

async function fetchEvents(page) {
  const url = encodeURI(`/api/events?page=${page}`);
  isFetching = true;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();

    if (page === 0) {
      // First page: replace existing list
      eventsContainer.innerHTML = "";
    }

    renderEvents(data.data);
    nextPage = data.nextPage;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  } finally {
    isFetching = false;
  }
}

function renderEvents(events) {
  events.forEach((event) => {
    const eventBox = document.createElement("div");
    eventBox.classList.add("event-box");
    eventBox.addEventListener("click", () => {
      window.location.href = `/event/${event.id}`;
    });

    if (event.category) {
      eventBox.classList.add(event.category); // Add category class
    }

    // Create the image element
    const img = document.createElement("img");
    img.src = event.pic;
    img.alt = event.eventName;

    // Create the title element
    const title = document.createElement("div");
    title.classList.add("div-event-title");
    title.textContent = event.eventName;

    // Append image and title to the event box
    eventBox.appendChild(img);
    eventBox.appendChild(title);

    // Append the event box to the container
    eventsContainer.appendChild(eventBox);
  });
}
fetchEvents(0);
