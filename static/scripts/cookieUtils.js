// Function to set a cookie
export function setCookie(name, value, minutes) {
  let expires = "";
  if (minutes) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Function to save selection to a cookie
// export function saveSelectionToCookie(
//   area,
//   quantity,
//   pricePerTicket,
//   selectedSeats
// ) {
//   // Ensure selectedSeats is an array
//   if (!Array.isArray(selectedSeats)) {
//     console.error("Selected seats should be an array.");
//     selectedSeats = []; // Default to empty array if not an array
//   }

//   // Assuming that we are saving a JSON string to the cookie
//   const selection = {
//     area,
//     quantity,
//     pricePerTicket,
//     seats: selectedSeats, // Save selected seats as an array
//   };

//   // Save to cookie (assuming a function setCookie exists)
//   setCookie("userSelection", JSON.stringify(selection), 1); // Expires in 1 day
// }

// Function to save selection to cookie
export function saveSelectionToCookie(
  areaName,
  quantity,
  selectedSeats,
  price
) {
  // Save user selection
  setCookie(
    "userSelection",
    JSON.stringify({
      area: areaName,
      quantity: quantity,
      price: price,
    }),
    30
  );

  // Save detailed seat selection
  const seatData = selectedSeats.map((seat) => ({
    row: seat.row,
    number: seat.seat,
  }));
  setCookie("seatSelection", JSON.stringify(seatData), 30);
}

// Function to load selection from cookie
export function loadSelectionFromCookie() {
  const userSelection = getCookie("userSelection");
  const seatSelection = getCookie("seatSelection");

  if (userSelection) {
    const { area, quantity, price } = JSON.parse(userSelection);
    console.log("User Selection:", { area, quantity, price });
  }

  if (seatSelection) {
    const seats = JSON.parse(seatSelection);
    console.log("Seat Selection:", seats);
    // Handle the loaded seat selection if needed
  }
}
