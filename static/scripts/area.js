import {
  handleModal,
  handleSignOut,
  verifyUserSignInToken,
  checkUserSignInStatus,
  handleForms,
} from "./userApi.js";

let eventId;
let selectedAreaName = "";
let selectedAreaPrice = 0;
const ticketOptionsContainer = document.getElementById("ticket-options");

document.addEventListener("DOMContentLoaded", () => {
  // Extract attraction ID from URL
  const href = location.href;
  // const pattern = /^https?:\/\/.+\/event\/(\d+)/;
  const pattern = /\/area\/(\d+)/;
  const match = href.match(pattern);
  if (match) {
    eventId = match[1];
  } else {
    console.error("Invalid URL format. Unable to extract event ID.");
  }

  const areas = document.querySelectorAll(".area");

  areas.forEach((area) => {
    area.addEventListener("click", () => {
      selectedAreaName = area.getAttribute("data-area");
      selectedAreaPrice = parseInt(
        area.querySelector(".area-price").textContent.replace(/\D/g, ""),
        10
      );
      displayTicketOptions(selectedAreaName, selectedAreaPrice);
      areas.forEach((a) => a.classList.remove("selected"));
      area.classList.add("selected");
    });
  });
});

function displayTicketOptions(areaId, price) {
  ticketOptionsContainer.innerHTML = `
    <h2>選擇座位</h2>
    <h2>所選擇區域 ${areaId}區</h2>
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

  document
    .querySelector(".confirm-button")
    .addEventListener("click", async () => {
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
        const availableSeats = await fetchAvailableSeats(
          selectedAreaName,
          quantity
        );
        showSeatDiagramModal(quantity, selectedAreaPrice);
      } else if (optionValue === "auto") {
        autoSelectSeats(selectedAreaName, quantity);
      }
    });
}

async function fetchAvailableSeats(area, quantity) {
  const response = await fetch("/api/check-seats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ area, quantity }),
  });
  if (!response.ok) throw new Error("Failed to fetch available seats.");
  const data = await response.json();
  console.log("Fetched Seats:", data);
  return data;
}

async function autoSelectSeats(area, quantity) {
  const data = await fetchAvailableSeats(area, quantity);
  console.log("Fetched Data:", data); // Log the full data including area and seats

  if (!data.available || data.seats.length === 0) {
    alert("No seats available");
    return;
  }

  // Assuming each seat object has 'id', 'row', 'number', and 'price'
  const seatDetails = data.seats.map((seat) => ({
    id: seat.id,
    row: seat.row,
    number: seat.number,
    price: seat.price,
    area: data.area,
  }));
  console.log("Seat Details to hold:", seatDetails); // Log full seat details

  const seatIds = seatDetails.map((seat) => seat.id);

  try {
    const response = await fetch("/api/hold-seats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatIds }),
    });

    if (response.ok) {
      // Store the held seats in sessionStorage to retrieve in checkout
      sessionStorage.setItem("selectedSeats", JSON.stringify(seatDetails));
      // window.location.href = "checkout.html";
      window.location.href = `/checkout/${eventId}`;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to hold seats.");
    }
  } catch (error) {
    console.error("Error holding seats:", error);
    alert("Error holding seats: " + error.message);
  }
}

async function holdSeat(seatId) {
  const response = await fetch("/api/hold-seats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seatIds: [seatId] }),
  });
  if (!response.ok) throw new Error("Failed to hold seat.");
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
  <div style="text-align: center; margin-bottom: 10px">
    <h2>↑↑↑座位面向↑↑↑</h2>
    <h2>所選擇區域 ${selectedAreaName}區</h2>
    <button class="close-modal">關閉</button>
    <button class="seat-confirm-button">確認選位</button>
  </div>
  <div id="seat-container">${createSeatDiagram()}</div>
`;

  modalContent
    .querySelector(".seat-confirm-button")
    .addEventListener("click", async () => {
      const selectedSeats = document.querySelectorAll(".seat.selected");
      const seatData = Array.from(selectedSeats).map((seat) => ({
        area: selectedAreaName,
        row: seat.dataset.row,
        number: seat.dataset.seat,
        price: selectedAreaPrice,
      }));
      sessionStorage.setItem("selectedSeats", JSON.stringify(seatData));
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

function handleSeatSelection(seatElement) {
  const maxSeats = Number(document.getElementById("ticket-quantity").value);
  const selectedSeats = document.querySelectorAll(".seat.selected");

  if (
    selectedSeats.length >= maxSeats &&
    !seatElement.classList.contains("selected")
  ) {
    alert("已選擇最大數量的座位");
    return;
  }

  seatElement.classList.toggle("selected");
  if (seatElement.classList.contains("selected")) {
    seatElement.style.backgroundColor = "blue";
    seatElement.style.color = "white";
  } else {
    seatElement.style.backgroundColor = "";
    seatElement.style.color = "";
  }
}

function createSeatDiagram() {
  const rows = 25;
  const seatsPerRow = 20;
  let diagram = "";

  for (let row = 1; row <= rows; row++) {
    diagram += `<div class="row">Row ${row}<br>`; // Start of a row
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      const seatId = `row-${row}-seat-${seat}`;
      diagram += `
        <div class="seat" data-row="${row}" data-seat="${seat}" id="${seatId}">
          ${seat}
        </div>
      `;
    }
    diagram += `</div><br>`; // End of a row and add a line break
  }

  return diagram;
}
