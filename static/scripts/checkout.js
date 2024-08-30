import { fetchMemberData, requireAuth } from "./signin-signup.js";

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  let seatIds = [];
  let totalPrice = 0;

  fetch("/api/seats/locked", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch locked seats.");
      }
      return response.json();
    })
    .then((data) => {
      const seatData = data.seats;
      if (seatData && seatData.length > 0) {
        seatIds = seatData.map((seat) => seat.id);
        displaySummaryTable(seatData);
      } else {
        document.getElementById("summary-container").innerHTML =
          "<p>No selection found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching locked seats:", error);
      document.getElementById("summary-container").innerHTML =
        "<p>Error fetching seat data.</p>";
    });

  function displaySummaryTable(seats) {
    totalPrice = 0;

    const seatRows = seats
      .map((seat) => {
        const price = Number(seat.price);
        totalPrice += price;
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

      if (paymentMethod === "ibon") {
        const orderData = {
          seatIds,
          amount: totalPrice,
        };

        fetch("/api/orders/ibon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(orderData),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((error) => {
                throw new Error(`Order creation failed: ${error.message}`);
              });
            }
            return response.json();
          })
          .then((data) => {
            const orderNumber = data.data.number;
            const ibonNumber = data.data.ibonNumber;
            window.location.href = `/finish.html?orderNumber=${orderNumber}`;
          })
          .catch((error) => {
            console.error("Error creating order:", error);
            alert("Error creating order. Please try again.");
          });
      } else if (paymentMethod === "credit-card") {
        window.location.href = `/booking.html`;
      } else {
        alert("請選擇付款方式。");
      }
    } else {
      alert("請選擇付款方式。");
    }
  });

  const cancelButton = document.getElementById("cancel-button");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      fetch("/api/seats/release", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to release seats.");
          }
          return response.text();
        })
        .then(() => {
          window.location.href = "/";
        })
        .catch((error) => {
          console.error("Error releasing seats:", error);
          alert("Error releasing seats. Please try again.");
        });
    });
  }
});
