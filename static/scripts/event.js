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

      // Smooth scroll to the tab content considering the navbar height
      window.scrollTo({
        top: targetContent.offsetTop - navbarHeight, // Adjust scroll position
        behavior: "smooth",
      });
    }
  };

  // Add click event listener to each tab
  tabs.forEach((tab) => tab.addEventListener("click", handleTabClick));

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
      window.location.href = "area.html";
    });
  }

  // Add scroll event listener to update active tab
  window.addEventListener("scroll", updateActiveTabOnScroll);
});
