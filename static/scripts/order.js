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
      return;
    }

    const prime = result.card.prime;
    const contactName = document.getElementById("member-name").value;
    const contactEmail = document.getElementById("member-email").value;
    const contactPhone = document.getElementById("member-phone").value;

    const orderData = {
      prime: prime,
      order: {
        contact: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
        },
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
        if (!response.ok) {
          return response.json().then((error) => {
            console.error("Error response from server:", error); // Log the error response
            throw new Error(`Booking failed: ${error.message}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.data.payment.status === 1) {
          window.location.href = `/finish?number=${data.data.number}`;
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

async function fetchOrderData(orderNumber) {
  const response = await fetch(`/api/order/${orderNumber}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch ordered data");
  }
  return await response.json();
}
