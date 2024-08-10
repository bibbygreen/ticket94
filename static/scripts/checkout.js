document.addEventListener("DOMContentLoaded", () => {
  // Function to get a cookie
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Function to check available seats
  function checkAvailableSeats(area, quantity) {
    fetch("/api/check-seats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ area, quantity }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.available) {
          displaySummaryTable(area, quantity, data.seats);
        } else {
          document.getElementById("summary-container").innerHTML =
            "<p>No available seats.</p>";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Function to display the summary table
  function displaySummaryTable(area, quantity, seats) {
    let totalPrice = 0;
    let seatRows = seats
      .map((seat) => {
        totalPrice += seat.price;
        return `
        <tr>
          <td>${seat.seat_num}</td>
          <td>${seat.price}</td>
        </tr>
      `;
      })
      .join("");

    document.getElementById("summary-container").innerHTML = `
      <h2>Booking Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Seat</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${seatRows}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>${totalPrice}元</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  // Load selection from cookie
  const selection = getCookie("userSelection");
  if (selection) {
    const { area, quantity } = JSON.parse(selection);
    checkAvailableSeats(area, quantity);
  } else {
    document.getElementById("summary-container").innerHTML =
      "<p>No selection found.</p>";
  }
});
