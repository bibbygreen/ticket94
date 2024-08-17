import { fetchMemberData } from "./userApi.js";

function generateIbonNumber() {
  return Math.floor(
    1000000000000000 + Math.random() * 9000000000000000
  ).toString();
}

document.addEventListener("DOMContentLoaded", () => {
  // Retrieve and display the seat data from session storage
  const seatData = JSON.parse(sessionStorage.getItem("selectedSeats"));
  if (seatData && seatData.length > 0) {
    displaySummaryTable(seatData);
  } else {
    document.getElementById("summary-container").innerHTML =
      "<p>No seat selection found.</p>";
  }

  // Fetch and display user data
  fetchMemberData()
    .then((user) => {
      document.getElementById("member-name").textContent = user.name;
      document.getElementById("member-email").textContent = user.email;
      document.getElementById("member-phone").textContent = user.phone;
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });

  const previousButton = document.getElementById("previous-button");
  if (previousButton) {
    previousButton.addEventListener("click", () => {
      window.location.href = "area.html"; // Change this to the correct URL if necessary
    });
  }
});

function displaySummaryTable(seats) {
  let totalPrice = 0;
  const seatRows = seats
    .map((seat) => {
      totalPrice += seat.price;
      return `
      <tr>
        <td>${seat.area}區</td>
        <td>${seat.row}排${seat.number}號</td>
        <td>全票</td>
        <td>${seat.price}元</td>
      </tr>
    `;
    })
    .join("");

  // Get order number from localStorage
  const orderNumber = localStorage.getItem("orderNumber");

  document.getElementById("summary-container").innerHTML = `
    <h2>訂單資料</h2>
    <p>訂單編號：<span id="order-number">${
      orderNumber ? orderNumber : "N/A"
    }</span></p>
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
        <tr>
          <td colspan="3" style="text-align: right;">總金額</td>
          <td style="color:red">${totalPrice} 元</td>
        </tr>
      </tbody>
    </table>
  `;
}
