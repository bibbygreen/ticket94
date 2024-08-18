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

    // Get order number from the URL using getQueryParam function
    const orderNumber = getQueryParam("orderNumber");

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
            <td colspan="3" style="text-align: right;">總金額</td>
            <td id="amount" style="color:red">${totalPrice} 元</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // Example usage of displaySummaryTable:
  // Assuming you have some logic to retrieve seats from session storage
  const seatData = JSON.parse(sessionStorage.getItem("selectedSeats"));
  if (seatData && seatData.length > 0) {
    displaySummaryTable(seatData);
  } else {
    document.getElementById("summary-container").innerHTML =
      "<p>No seat selection found.</p>";
  }
});
