import { getCookie, saveSelectionToCookie } from "./cookieUtils.js";
import { fetchMemberData } from "./userApi.js";

document.addEventListener("DOMContentLoaded", () => {
  function checkAvailableSeats(area, quantity) {
    const quantityNumber = Number(quantity);

    fetch("/api/check-seats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ area, quantity: quantityNumber }),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data.available) {
          const pricePerTicket = data.price;
          displaySummaryTable(area, quantityNumber, data.seats, pricePerTicket);
          saveSelectionToCookie(area, quantityNumber, pricePerTicket);
        } else {
          document.getElementById("summary-container").innerHTML =
            "<p>No available seats.</p>";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  fetchMemberData()
    .then((user) => {
      document.getElementById("member-name").textContent = user.name;
      document.getElementById("member-email").textContent = user.email;
      document.getElementById("member-phone").textContent = user.phone;
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      // Handle error, e.g., show a message to the user
    });

  function displaySummaryTable(area, quantity, seats, pricePerTicket) {
    console.log(area);
    console.log(quantity);
    console.log(seats);
    console.log(pricePerTicket);

    let totalPrice = 0;

    let seatRows = seats
      .map((seat) => {
        totalPrice += seat.price;
        return `
          <tr>
          <td>${area}區</td>
          <td>${seat.row}排${seat.number}號</td>
          <td>全票</td>
          <td>${seat.price}元</td>
        </tr>
        `;
      })
      .join("");

    document.getElementById("summary-container").innerHTML = `
      <h2>確認選位結果</h2>
      <table>
        <thead>
          <tr>
            <th>票區</th>
            <th>位置</th>
            <th>票種</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          ${seatRows}
        </tbody>
 
      </table>
    `;
  }

  // Load selection from cookie
  const selection = getCookie("userSelection");
  if (selection) {
    const { area, quantity } = JSON.parse(selection);
    const quantityNumber = Number(quantity); // Ensure quantity is a number
    // console.log("Loaded from cookie:", { area, quantityNumber }); // Debug
    checkAvailableSeats(area, quantityNumber);
  } else {
    document.getElementById("summary-container").innerHTML =
      "<p>No selection found.</p>";
  }
});
