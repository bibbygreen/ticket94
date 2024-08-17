import { getCookie, saveSelectionToCookie } from "./cookieUtils.js";
import { fetchMemberData } from "./userApi.js";

function generateOrderNumber() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

document.addEventListener("DOMContentLoaded", () => {
  const userSelection = getCookie("userSelection");
  const seatSelection = getCookie("seatSelection");

  if (seatSelection && seatSelection.trim() !== "[]") {
    // Handle manual seat selection
    const seats = JSON.parse(seatSelection);
    const { area, quantity, price } = JSON.parse(userSelection);
    console.log("User Selection:", { area, quantity, price });
    console.log("Seat Selection:", seats);
    displaySummaryTable(area, quantity, seats, price);
  } else if (userSelection) {
    // Handle computer-assisted seat selection
    const { area, quantity } = JSON.parse(userSelection);
    checkAvailableSeats(area, quantity);
  } else {
    document.getElementById("summary-container").innerHTML =
      "<p>No selection found.</p>";
  }

  // Function to check available seats and display summary
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

  // function checkAvailableSeats(area, quantity) {
  //   const quantityNumber = Number(quantity);

  //   fetch("/api/check-seats", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ area, quantity: quantityNumber }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.available) {
  //         const pricePerTicket = data.price;
  //         const availableSeats = data.seats;
  //         const seatsToSelect = availableSeats.slice(0, quantityNumber);

  //         if (seatsToSelect.length > 0) {
  //           displaySummaryTable(
  //             area,
  //             quantityNumber,
  //             seatsToSelect,
  //             pricePerTicket
  //           );
  //           saveSelectionToCookie(
  //             area,
  //             quantityNumber,
  //             seatsToSelect,
  //             pricePerTicket
  //           );
  //         } else {
  //           document.getElementById("summary-container").innerHTML =
  //             "<p>No available seats.</p>";
  //         }
  //       } else {
  //         document.getElementById("summary-container").innerHTML =
  //           "<p>No available seats.</p>";
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // }

  function displaySummaryTable(area, quantity, seats, pricePerTicket) {
    let totalPrice = 0;
    let totalTicket = seats.length;

    let seatRows = seats
      .map((seat) => {
        const row = seat.row;
        const number = seat.number; // Use seat.seat instead of seat.number
        const price = seat.price || pricePerTicket;
        totalPrice += price;
        return `
        <tr>
          <td>${area}區</td>
          <td>${row}排${number}號</td>
          <td>全票</td>
          <td>${price}元</td>
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

  // Handle form submission
  document.querySelector(".confirm-button").addEventListener("click", () => {
    const selectedPaymentMethod = document.querySelector(
      'input[name="payment-method"]:checked'
    );

    if (selectedPaymentMethod) {
      const paymentMethod = selectedPaymentMethod.value;
      const orderNumber = generateOrderNumber();

      // Save orderNumber to localStorage
      localStorage.setItem("orderNumber", orderNumber);

      if (paymentMethod === "credit-card") {
        window.location.href = `/booking.html`;
      } else if (paymentMethod === "ibon") {
        window.location.href = `/finish.html?orderNumber=${orderNumber}`;
        // Handle ibon payment method
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
