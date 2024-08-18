const ibonNumber = localStorage.getItem("ibonNumber");

if (ibonNumber) {
  // Render the ibonNumber
  const orderDetailsDiv = document.getElementById("order-details");
  orderDetailsDiv.innerHTML = `
                <p>您的ibon繳費序號為: <strong style="color:red">${ibonNumber}</strong></p>
                <p>請於訂單成立1小時內完成付款取票，逾時系統將自動取消本筆訂單</p>
            `;
}
