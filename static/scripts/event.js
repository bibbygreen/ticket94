document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const navbarHeight = document.querySelector(".tabs").offsetHeight;

  // Function to handle tab click
  const handleTabClick = (event) => {
    // Remove active class from all tabs and contents
    tabs.forEach((tab) => tab.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Add active class to clicked tab and related content
    const targetTab = event.target;
    targetTab.classList.add("active");

    const contentId = "tab-content-" + targetTab.id.replace("tab-", "");
    const targetContent = document.getElementById(contentId);
    if (targetContent) {
      targetContent.classList.add("active");

      window.scrollTo({
        top: targetContent.offsetTop - 1.5 * navbarHeight,
        behavior: "smooth",
      });
    }
  };

  // Add click event listener to each tab
  tabs.forEach((tab) => tab.addEventListener("click", handleTabClick));

  async function fetchEvent(eventId) {
    const url = `http://localhost:8001/api/event/${eventId}`;
    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      renderEvent(data);
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  }
  function renderEvent(data) {
    const headerContainer = document.querySelector(".header-container");
    const eventTitle = headerContainer.querySelector(".event-title");
    const headerImg = headerContainer.querySelector(".header-img");

    // Check if elements are found
    if (!eventTitle || !headerImg) {
      console.error("Error: header elements not found");
      return;
    }
    // Update header with event data
    eventTitle.textContent = data.eventName;
    headerImg.src = data.pic;
    headerImg.alt = data.eventName;

    const tabContentBuying = document.getElementById("tab-content-buying");
    const tabContentIntroduction = document.getElementById(
      "tab-content-introduction"
    );

    tabContentBuying.innerHTML = `
    <h2>立即購買</h2>
    <table class="buying-details">
      <thead>
        <tr>
          <th>場次名稱</th>
          <th>場次日期</th>
          <th>場次時間</th>
          <th>場次地點</th>
          <th>售票狀態</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${data.eventName}</td>
          <td>${data.date}</td>
          <td>${data.time}</td>
          <td>${data.location}</td>
          <td><button class="buy-button">立即購買</button></td>
        </tr>
      </tbody>
    </table>
  `;

    // Update "活動介紹" tab content
    tabContentIntroduction.innerHTML = `
    <h2>活動介紹</h2>
    <p>${data.description}</p>
  `;
  }

  // Function to highlight the active tab based on scroll position
  const updateActiveTabOnScroll = () => {
    let currentId = "";

    tabContents.forEach((content) => {
      const rect = content.getBoundingClientRect();
      if (
        rect.top <= window.innerHeight / 2 &&
        rect.bottom >= window.innerHeight / 2
      ) {
        currentId = content.id.replace("tab-content-", "tab-");
      }
    });

    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.id === currentId);
    });
  };

  const buyButton = document.querySelector(".buy-button");
  if (buyButton) {
    buyButton.addEventListener("click", function () {
      // Redirect to 'area.html'
      window.location.href = "area.html"; /////////////
    });
  }

  // Add scroll event listener to update active tab
  window.addEventListener("scroll", updateActiveTabOnScroll);

  // Extract attraction ID from URL
  const href = location.href;
  const pattern = /^http:.+\/event\/(\d+)$/;
  const match = href.match(pattern);
  if (match) {
    const eventId = match[1];
    fetchEvent(eventId);
  } else {
    console.error("Invalid URL format. Unable to extract attraction ID.");
  }
});
