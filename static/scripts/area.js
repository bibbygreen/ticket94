document.addEventListener("DOMContentLoaded", () => {
  const areas = document.querySelectorAll(".area");
  const ticketOptionsContainer = document.getElementById("ticket-options");

  // Function to set a cookie
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  // Function to get a cookie
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Function to save user selection to cookies
  function saveSelectionToCookie(area, quantity) {
    const selection = { area: area, quantity: quantity };
    setCookie("userSelection", JSON.stringify(selection), 7); // Cookie expires in 7 days
  }

  // Function to load and display user selection from cookies
  function loadSelectionFromCookie() {
    const selection = getCookie("userSelection");
    if (selection) {
      const { area, quantity } = JSON.parse(selection);
      // Display the stored selection if needed
      console.log("Selected Area:", area);
      console.log("Number of Tickets:", quantity);
    }
  }

  // Load selection from cookie on page load
  loadSelectionFromCookie();

  function displayTicketOptions(areaName) {
    ticketOptionsContainer.innerHTML = `
      <h2>所選擇區域 ${areaName}區</h2>
      <label for="ticket-quantity">購買張數:</label>
      <select id="ticket-quantity">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select><br>
      <button class="confirm-button">確認</button>
    `;
    ticketOptionsContainer.classList.add("active");

    // Add event listener to the confirm button
    document.querySelector(".confirm-button").addEventListener("click", () => {
      const quantity = document.getElementById("ticket-quantity").value;
      saveSelectionToCookie(areaName, quantity);
      window.location.href = "checkout.html";
    });
  }

  // Add event listeners to area elements
  areas.forEach((area) => {
    area.addEventListener("click", () => {
      const areaName = area.getAttribute("data-area");
      displayTicketOptions(areaName);

      // Remove 'selected' class from all areas
      areas.forEach((a) => a.classList.remove("selected"));

      // Add 'selected' class to the clicked area
      area.classList.add("selected");
    });
  });
});
