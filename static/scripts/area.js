import {
  saveSelectionToCookie,
  getCookie,
  loadSelectionFromCookie,
} from "./cookieUtils.js";

import {
  handleModal,
  handleSignOut,
  verifyUserSignInToken,
  checkUserSignInStatus,
  handleForms,
} from "./userApi.js";

let selectedAreaName = "";
let selectedSeats = [];
let selectedAreaPrice = 0;
const ticketOptionsContainer = document.getElementById("ticket-options");

document.addEventListener("DOMContentLoaded", () => {
  const areas = document.querySelectorAll(".area");

  // Load selection from cookie on page load
  loadSelectionFromCookie();

  function displayTicketOptions(areaName, price) {
    selectedAreaName = areaName;
    selectedAreaPrice = price;
    ticketOptionsContainer.innerHTML = `
      <h2>選擇座位</h2>
      <h2>所選擇區域 ${areaName}區</h2>
      <label for="ticket-quantity">購買張數:</label>
      <select id="ticket-quantity">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </select><br>
      <div class="selection-options">
        <label><input type="radio" name="seat-selection" value="manual"> 自行選位</label>
        <label><input type="radio" name="seat-selection" value="auto"> 電腦配位</label>
      </div>
      <button class="confirm-button">確認</button>
    `;
    ticketOptionsContainer.classList.add("active");

    // Add event listener to the confirm button
    document.querySelector(".confirm-button").addEventListener("click", () => {
      const quantity = document.getElementById("ticket-quantity").value;
      const selectedOption = document.querySelector(
        'input[name="seat-selection"]:checked'
      );

      if (!selectedOption) {
        alert("請選擇座位選擇方式。");
        return;
      }

      const optionValue = selectedOption.value;

      if (optionValue === "manual") {
        showSeatDiagramModal(quantity, selectedAreaPrice);
      } else if (optionValue === "auto") {
        try {
          const availableSeats = getAvailableSeats(selectedAreaName, quantity);
          console.log("Available Seats:", availableSeats);
          saveSelectionToCookie(
            selectedAreaName,
            quantity,
            [],
            selectedAreaPrice
          );
          window.location.href = "checkout.html";
        } catch (error) {
          console.error("Error fetching available seats:", error);
        }
      }
    });
  }

  function showSeatDiagramModal(quantity, price) {
    const modal = document.createElement("div");
    modal.id = "seat-diagram-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "5px";
    modalContent.style.position = "relative";
    modalContent.style.width = "80%";
    modalContent.style.maxWidth = "800px";
    modalContent.style.maxHeight = "80vh";
    modalContent.style.overflowY = "auto"; // Add vertical scrollbar if needed

    modalContent.innerHTML = `
    <h2>↑↑↑座位面向↑↑↑</h2>
    <h2>所選擇區域 ${selectedAreaName}區</h2>
    <button class="close-modal">關閉</button>
    <button class="seat-confirm-button">確認選位</button>
    <div id="seat-container">${createSeatDiagram()}</div>
  `;

    modalContent
      .querySelector(".seat-confirm-button")
      .addEventListener("click", () => {
        const selectedSeats = document.querySelectorAll(".seat.selected");
        const seatData = Array.from(selectedSeats).map((seat) => ({
          row: seat.dataset.row,
          seat: seat.dataset.seat,
        }));
        saveSelectionToCookie(selectedAreaName, quantity, seatData, price);
        modal.style.display = "none";
        window.location.href = "checkout.html";
      });

    const closeButton = modalContent.querySelector(".close-modal");
    closeButton.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    document.querySelectorAll(".seat").forEach((seat) => {
      seat.addEventListener("click", () => {
        handleSeatSelection(seat);
      });
    });
  }

  function createSeatDiagram() {
    const rows = 25;
    const seatsPerRow = 20;
    let diagram = "";

    for (let row = 1; row <= rows; row++) {
      diagram += `<div class="row">Row ${row}<br>`; // Start of a row
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        diagram += `
          <div class="seat" id="row-${row}-seat-${seat}" data-row="${row}" data-seat="${seat}">
            ${seat}
          </div>
        `;
      }
      diagram += `</div><br>`; // End of a row and add a line break
    }

    return diagram;
  }

  function handleSeatSelection(seatElement) {
    const maxSeats = Number(document.getElementById("ticket-quantity").value);

    if (
      selectedSeats.length >= maxSeats &&
      !seatElement.classList.contains("selected")
    ) {
      alert("已選擇最大數量的座位");
      return;
    }

    seatElement.classList.toggle("selected");

    // Change seat color
    const seatId = seatElement.id;
    if (seatElement.classList.contains("selected")) {
      seatElement.style.backgroundColor = "blue";
      seatElement.style.color = "white";
      if (!selectedSeats.includes(seatId)) {
        selectedSeats.push(seatId);
      }
    } else {
      seatElement.style.backgroundColor = "";
      seatElement.style.color = "";
      selectedSeats = selectedSeats.filter((seat) => seat !== seatId);
    }
  }

  async function getAvailableSeats(area, quantity) {
    const response = await fetch("/api/check-seats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ area, quantity }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available seats.");
    }

    return response.json();
  }

  // Add event listeners to area elements
  areas.forEach((area) => {
    area.addEventListener("click", () => {
      const areaName = area.getAttribute("data-area");
      const areaPrice = parseInt(
        area.querySelector(".area-price").textContent.replace(/\D/g, ""),
        10
      );
      displayTicketOptions(areaName, areaPrice);

      // Remove 'selected' class from all areas
      areas.forEach((a) => a.classList.remove("selected"));
      // Add 'selected' class to the clicked area
      area.classList.add("selected");
    });
  });
});
