import { fetchMemberData } from "./userApi.js";

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
  const cancelButton = document.querySelector(".cancel-button");
  if (previousButton) {
    previousButton.addEventListener("click", () => {
      window.location.href = "/area.html"; // Change this to the correct URL if necessary
    });
  }
  cancelButton.addEventListener("click", function () {
    window.location.href = "/";
  });
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
          <td colspan="3" style="text-align: right;">訂購張數</td>
          <td style="color:blue">${totalTicket} 張</td>
        </tr>
        <tr>
          <td colspan="3" style="text-align: right;">總金額</td>
          <td  id="amount" style="color:red">${totalPrice} 元</td>
        </tr>
      </tbody>
    </table>
  `;
}
