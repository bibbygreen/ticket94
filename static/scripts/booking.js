import { getCookie, saveSelectionToCookie } from "./cookieUtils.js";
import { fetchMemberData } from "./userApi.js";

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
        saveSelectionToCookie(area, quantityNumber, seats, pricePerTicket);
      } else {
        document.getElementById("summary-container").innerHTML =
          "<p>No available seats.</p>";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Retrieve and display order number
const previousButton = document.getElementById("previous-button");

if (previousButton) {
  previousButton.addEventListener("click", () => {
    console.log("Previous button clicked");
    window.location.href = "checkout.html";
  });
}

fetchMemberData()
  .then((user) => {
    document.getElementById("member-name").textContent = user.name;
    document.getElementById("member-email").textContent = user.email;
    document.getElementById("member-phone").textContent = user.phone;
  })
  .catch((error) => {
    console.error("Error fetching user data:", error);
    // Handle error, e.g., show a message to the user
  });

// Export the displaySummaryTable function
export function displaySummaryTable(area, quantity, seats, pricePerTicket) {
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
          <td colspan="3" style="text-align: right;">訂購張數</td>
          <td style="color:blue">${totalTicket} 張</td>
        </tr>
        <tr>
          <td colspan="3" style="text-align: right;">總金額</td>
          <td style="color:red">${totalPrice} 元</td>
        </tr>
      </tbody>
    </table>
  `;

  // Optionally clear the order number from storage after displaying
  // localStorage.removeItem('orderNumber');
}

// Load selection from cookie
const selection = getCookie("userSelection");
if (selection) {
  const { area, quantity, seats, pricePerTicket } = JSON.parse(selection);
  const quantityNumber = Number(quantity);

  // Debugging output
  console.log("Loaded user selection:", {
    area,
    quantity,
    seats,
    pricePerTicket,
  });

  if (seats && seats.length > 0) {
    displaySummaryTable(area, quantityNumber, seats, pricePerTicket);
  } else {
    checkAvailableSeats(area, quantityNumber);
  }
} else {
  document.getElementById("summary-container").innerHTML =
    "<p>No selection found.</p>";
}

////////////////////
// document.addEventListener("DOMContentLoaded", () => {
//   function checkAvailableSeats(area, quantity) {
//     const quantityNumber = Number(quantity);

//     fetch("/api/check-seats", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ area, quantity: quantityNumber }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         // console.log(data);
//         if (data.available) {
//           const pricePerTicket = data.price;
//           displaySummaryTable(area, quantityNumber, data.seats, pricePerTicket);
//           saveSelectionToCookie(area, quantityNumber, pricePerTicket);
//         } else {
//           document.getElementById("summary-container").innerHTML =
//             "<p>No available seats.</p>";
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   }
//   // Retrieve and display order number

//   const previousButton = document.getElementById("previous-button");

//   if (previousButton) {
//     previousButton.addEventListener("click", () => {
//       console.log("Previous button clicked");
//       window.location.href = "checkout.html";
//     });
//   }

//   fetchMemberData()
//     .then((user) => {
//       document.getElementById("member-name").textContent = user.name;
//       document.getElementById("member-email").textContent = user.email;
//       document.getElementById("member-phone").textContent = user.phone;
//     })
//     .catch((error) => {
//       console.error("Error fetching user data:", error);
//       // Handle error, e.g., show a message to the user
//     });

//   function displaySummaryTable(area, quantity, seats, pricePerTicket) {
//     console.log(area);
//     console.log(quantity);
//     console.log(seats);
//     console.log(pricePerTicket);

//     let totalPrice = 0;
//     let totalTicket = seats.length;

//     let seatRows = seats
//       .map((seat) => {
//         totalPrice += seat.price;
//         return `
//           <tr>
//           <td>${area}區</td>
//           <td>${seat.row}排${seat.number}號</td>
//           <td>全票</td>
//           <td>${seat.price}元</td>
//         </tr>
//         `;
//       })
//       .join("");

//     // Get order number from localStorage
//     const orderNumber = localStorage.getItem("orderNumber");

//     document.getElementById("summary-container").innerHTML = `
//       <h2>訂單資料</h2>
//       <p>訂單編號：<span id="order-number">${
//         orderNumber ? orderNumber : "N/A"
//       }</span></p>
//       <table>
//         <thead>
//           <tr>
//             <th>票區</th>
//             <th>位置</th>
//             <th>票種</th>
//             <th>金額</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${seatRows}
//           <tr>
//             <td colspan="3" style="text-align: right;">訂購張數</td>
//             <td style="color:blue">${totalTicket} 張</td>
//           </tr>
//           <tr>
//             <td colspan="3" style="text-align: right;">總金額</td>
//             <td style="color:red">${totalPrice} 元</td>
//           </tr>
//         </tbody>
//       </table>
//     `;

//     // Optionally clear the order number from storage after displaying
//     // localStorage.removeItem('orderNumber');
//   }

//   // Load selection from cookie
//   const selection = getCookie("userSelection");
//   if (selection) {
//     const { area, quantity } = JSON.parse(selection);
//     const quantityNumber = Number(quantity);
//     checkAvailableSeats(area, quantityNumber);
//   } else {
//     document.getElementById("summary-container").innerHTML =
//       "<p>No selection found.</p>";
//   }
// });

// export { displaySummaryTable };
