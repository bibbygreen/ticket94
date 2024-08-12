import {
  saveSelectionToCookie,
  getCookie,
  loadSelectionFromCookie,
} from "./cookieUtils.js";

document.addEventListener("DOMContentLoaded", () => {
  const areas = document.querySelectorAll(".area");
  const ticketOptionsContainer = document.getElementById("ticket-options");

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
