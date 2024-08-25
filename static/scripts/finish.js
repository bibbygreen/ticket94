document.addEventListener("DOMContentLoaded", () => {
  // Retrieve ibonNumber from localStorage
  const ibonNumber = localStorage.getItem("ibonNumber");

  if (ibonNumber) {
    // Render the ibonNumber
    const orderDetailsDiv = document.getElementById("order-details");
    orderDetailsDiv.innerHTML = `
      <p>您的ibon繳費序號為: <strong style="color:red">${ibonNumber}</strong></p>
      <p>請於訂單成立1小時內完成付款取票，逾時系統將自動取消本筆訂單</p>
    `;
  }

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const orderNumber = getQueryParam("orderNumber");
  console.log("Fetching seats for order number:", orderNumber);

  // 從後端獲取鎖定的座位資訊
  fetch(`/api/orders/${orderNumber}/seats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("無法獲取座位資訊。");
      }
      return response.json();
    })
    .then((data) => {
      const seatData = data.seats;
      if (seatData && seatData.length > 0) {
        displaySummaryTable(seatData); // 顯示座位資訊
      } else {
        document.getElementById("summary-container").innerHTML =
          "<p>無座位選擇。</p>";
      }
    })
    .catch((error) => {
      console.error("獲取座位時出錯：", error);
      document.getElementById("summary-container").innerHTML =
        "<p>獲取座位資訊時發生錯誤。</p>";
    });

  function displaySummaryTable(seats) {
    let totalPrice = 0;
    let totalTicket = seats.length;
    const seatRows = seats
      .map((seat) => {
        totalPrice += seat.price;
        return `
        <tr>
          <td>${seat.section_name || seat.area}區</td>
          <td>${seat.row_num || seat.row}排${seat.number}號</td>
          <td>全票</td>
          <td>${seat.price}元</td>
        </tr>
      `;
      })
      .join("");

    document.getElementById("summary-container").innerHTML = `
      <h2>訂單資料</h2>
      <p>訂單編號：<span id="order-number">${orderNumber}</span></p>
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
            <td id="amount" style="color:red">${totalPrice} 元</td>
          </tr>
        </tbody>
      </table>
    `;
  }
});
