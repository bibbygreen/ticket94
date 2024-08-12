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

// Function to save user selection to cookies
export function saveSelectionToCookie(area, quantity, price) {
  const selection = { area: area, quantity: quantity, price: price };
  setCookie("userSelection", JSON.stringify(selection), 30);
}

// Function to load and display user selection from cookies
export function loadSelectionFromCookie() {
  const selection = getCookie("userSelection");
  if (selection) {
    const { area, quantity, price } = JSON.parse(selection);
    // Display the stored selection if needed
    console.log("Selected Area:", area);
    console.log("Number of Tickets:", quantity);
    console.log("Price per Ticket:", price);
  }
}
