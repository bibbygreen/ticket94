import { fetchMemberData } from "./userApi.js";

function generateOrderNumber() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

function generateIbonNumber() {
  return Math.floor(
    1000000000000000 + Math.random() * 9000000000000000
  ).toString();
}

document.addEventListener("DOMContentLoaded", () => {
  // Fetch seat data stored in session storage
  const seatData = JSON.parse(sessionStorage.getItem("selectedSeats"));
  if (seatData && seatData.length > 0) {
    displaySummaryTable(seatData);
  } else {
    document.getElementById("summary-container").innerHTML =
      "<p>No selection found.</p>";
  }

  function displaySummaryTable(seats) {
    let totalPrice = 0;
    const seatRows = seats
      .map((seat) => {
        const price = Number(seat.price);
        totalPrice += price;
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

  fetchMemberData()
    .then((user) => {
      document.getElementById("member-name").textContent = user.name;
      document.getElementById("member-email").textContent = user.email;
      document.getElementById("member-phone").textContent = user.phone;
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });

  document.querySelector(".confirm-button").addEventListener("click", () => {
    const selectedPaymentMethod = document.querySelector(
      'input[name="payment-method"]:checked'
    );
    if (selectedPaymentMethod) {
      const paymentMethod = selectedPaymentMethod.value;

      if (paymentMethod === "credit-card") {
        window.location.href = `/booking.html`;
        // window.location.href = `/finish.html?orderNumber=${orderNumber}`;
      } else if (paymentMethod === "ibon") {
        const orderNumber = generateOrderNumber();
        localStorage.setItem("orderNumber", orderNumber);
        const ibonNumber = generateIbonNumber();
        localStorage.setItem("ibonNumber", ibonNumber);
        window.location.href = `/finish.html?orderNumber=${orderNumber}`;
      } else {
        alert("請選擇付款方式。");
      }
    } else {
      alert("請選擇付款方式。");
    }
  });

  const previousButton = document.getElementById("previous-button");
  if (previousButton) {
    previousButton.addEventListener("click", () => {
      window.location.href = "area.html";
    });
  }
});
