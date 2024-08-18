function setupTPDirectSDK() {
  TPDirect.setupSDK(
    151901,
    "app_vixuBsk4bJ7W6FZe0OBoujnI0ZnDoDMSaY0qPzrWxvcgV1DJply2PeV8BlZV",
    "sandbox"
  );

  let fields = {
    number: {
      element: "#card-number",
      placeholder: "**** **** **** ****",
    },
    expirationDate: {
      element: document.getElementById("card-expiration-date"),
      placeholder: "MM / YY",
    },
    ccv: {
      element: "#card-ccv",
      placeholder: "ccv",
    },
  };

  TPDirect.card.setup({
    fields: fields,
    styles: {
      input: {
        color: "gray",
      },
      ".valid": {
        color: "green",
      },
      ".invalid": {
        color: "red",
      },
      "@media screen and (max-width: 400px)": {
        input: {
          color: "orange",
        },
      },
    },
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
      beginIndex: 6,
      endIndex: 11,
    },
  });

  TPDirect.card.onUpdate(function (update) {
    const btnConfirmPayment = document.getElementById("confirm-button");
    if (update.canGetPrime) {
      btnConfirmPayment.removeAttribute("disabled");
    } else {
      btnConfirmPayment.setAttribute("disabled", true);
    }
  });

  const btnConfirmPayment = document.getElementById("confirm-button");
  btnConfirmPayment.addEventListener("click", onSubmitOrder);
}

async function onSubmitOrder(event) {
  event.preventDefault();

  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  if (!tappayStatus.canGetPrime) {
    alert("Cannot get prime. Please check the card information and try again.");
    return;
  }

  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      alert("Failed to get prime. Error: " + result.msg);
      console.error("Failed to get prime:", result);
      return;
    }

    const prime = result.card.prime;

    const contactName = document.getElementById("member-name").textContent;
    const contactEmail = document.getElementById("member-email").textContent;
    const contactPhone = document.getElementById("member-phone").textContent;

    if (!contactName || !contactEmail || !contactPhone) {
      alert("Missing cardholder information");
      return;
    }

    const amountText = document.getElementById("amount").textContent;
    const amount = parseInt(amountText.replace(/[^\d]/g, ""), 10);

    if (isNaN(amount)) {
      alert("Invalid amount value");
      return;
    }
    // const contactName = document.getElementById("member-name").value;
    // const contactEmail = document.getElementById("member-email").value;
    // const contactPhone = document.getElementById("member-phone").value;

    const orderData = {
      prime: prime,
      amount: amount, // Assuming amount is correctly retrieved as discussed earlier
      cardholder: {
        name: contactName,
        email: contactEmail,
        phone_number: contactPhone,
      },
    };

    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          return response.json().then((error) => {
            console.error("Error response from server:", error); // Log the error response
            throw new Error(`Booking failed: ${error.message}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Response data:", data);
        if (data.data.payment.status === 1) {
          window.location.href = `/finish.html?orderNumber=${data.data.number}`;
        } else {
          alert("交易失敗，敬請重新訂購");
          window.location.href = "/";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(`Booking failed. Please try again. Error: ${error.message}`);
        window.location.href = "/";
      });
  });
}

// Load TPDirect SDK
const script = document.createElement("script");
script.src = "https://js.tappaysdk.com/sdk/tpdirect/v5.14.0";
script.async = true;
document.head.appendChild(script);

// Execute setup function
script.onload = setupTPDirectSDK;
