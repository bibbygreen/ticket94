import { fetchMemberData } from "./signin-signup.js";

document.addEventListener("DOMContentLoaded", () => {
  let seatIds = [];

  fetch("/api/locked-seats", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`, // 使用 token 進行身份驗證
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("無法獲取鎖定的座位資訊。");
      }
      return response.json();
    })
    .then((data) => {
      const seatData = data.seats;
      if (seatData && seatData.length > 0) {
        seatIds = seatData.map((seat) => seat.id);
        displaySummaryTable(seatData); // 顯示座位資訊
      } else {
        document.getElementById("summary-container").innerHTML =
          "<p>無座位選擇。</p>";
      }
    })
    .catch((error) => {
      console.error("獲取鎖定座位時出錯：", error);
      document.getElementById("summary-container").innerHTML =
        "<p>獲取座位資訊時發生錯誤。</p>";
    });

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

  // const previousButton = document.getElementById("previous-button");
  const cancelButton = document.querySelector(".cancel-button");
  // if (previousButton) {
  //   previousButton.addEventListener("click", () => {
  //     window.location.href = "/area.html";
  //   });
  // }
  cancelButton.addEventListener("click", function () {
    window.location.href = "/";
  });
});

function displaySummaryTable(seats) {
  let totalPrice = 0;
  let totalTicket = seats.length;
  const seatRows = seats
    .map((seat) => {
      totalPrice += seat.price;
      return `
      <tr>
        <td>${seat.section_name}區</td>
        <td>${seat.row_num}排${seat.number}號</td>
        <td>全票</td>
        <td>${seat.price}元</td>
      </tr>
    `;
    })
    .join("");

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
