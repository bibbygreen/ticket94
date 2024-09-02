import { fetchMemberData, requireAuth } from "./signin-signup.js";
import { activateStep } from "./progress.js";

function formatDateTime(date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Taipei", // 指定轉換的時區
    hour12: false, // 24 小時制
  }).format(date);
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  activateStep(2);
  startCountdown();

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
        const holdExpiresAtString = seatData[0].hold_expires_At;
        const holdExpiresAt = new Date(Date.parse(holdExpiresAtString));
        const now = new Date();
        // console.log(holdExpiresAtString);
        // console.log("Hold Expires At:", holdExpiresAt);
        // console.log("Current Time:", now);

        let timeLeft = Math.floor((holdExpiresAt - now) / 1000);
        console.log("timeLeft:", timeLeft);
        if (timeLeft > 0) {
          startCountdown(timeLeft);
        } else {
          alert("您的訂單已逾期");
        }
      } else {
        document.getElementById("summary-container").innerHTML =
          "<p>尚未選擇任何座位。</p>";
      }
    })
    .catch((error) => {
      console.error("獲取座位時發生錯誤", error);
      document.getElementById("summary-container").innerHTML =
        "<p>獲取座位資訊時發生錯誤。</p>";
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

  function startCountdown(timeLeft) {
    const timerElement = document.getElementById("timer");

    const interval = setInterval(() => {
      if (timeLeft < 0) {
        clearInterval(interval);
        timerElement.textContent = "00:00";
        alert("逾時繳費，訂單已取消");
        window.location.href = "/";
        return;
      }

      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      if (!isNaN(minutes) && !isNaN(seconds)) {
        timerElement.textContent = `${minutes}:${
          seconds < 10 ? "0" : ""
        }${seconds}`;
      }

      timeLeft--;
    }, 1000);
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
