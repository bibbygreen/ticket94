// Utility function to verify user sign-in token
export async function verifyUserSignInToken() {
  const token = localStorage.getItem("token");
  if (token) {
    const response = await fetch("/api/user/auth", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Token verification failed");
    return await response.json();
  }
  return null;
}

// Function to handle modal operations
export function handleModal() {
  const modal = document.getElementById("myModal");
  const closeBtn = document.getElementsByClassName("close")[0];
  const navSignIn = document.getElementById("signin-signup");
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");
  const switchToSignUp = document.getElementById("switchToSignUp");
  const switchToSignIn = document.getElementById("switchToSignIn");
  const signInError = document.getElementById("signin-error");
  const signUpError = document.getElementById("signup-error");
  const signUpSuccess = document.getElementById("signup-success");

  function clickToShowModal() {
    modal.style.display = "block";
  }

  function closeModal() {
    modal.style.display = "none";
    resetForms();
  }

  function resetForms() {
    signInForm.reset();
    signUpForm.reset();
    signInError.textContent = "";
    signUpError.textContent = "";
    signUpSuccess.textContent = "";
  }

  navSignIn.onclick = clickToShowModal;

  window.onclick = (event) => {
    if (event.target === modal) closeModal();
  };

  closeBtn.onclick = closeModal;

  switchToSignUp.onclick = () => {
    signInForm.classList.remove("active");
    signUpForm.classList.add("active");
    signInError.textContent = "";
  };

  switchToSignIn.onclick = () => {
    signUpForm.classList.remove("active");
    signInForm.classList.add("active");
  };

  return { signInForm, signUpForm, signInError, signUpError, signUpSuccess };
}

// Function to handle sign out
export function handleSignOut() {
  localStorage.removeItem("token");
  checkUserSignInStatus();
}

// Function to check user sign-in status and update UI
export function checkUserSignInStatus() {
  verifyUserSignInToken()
    .then((data) => {
      const navSignIn = document.getElementById("signin-signup");
      if (data) {
        navSignIn.textContent = "會員中心";
        navSignIn.onclick = handleSignOut;
      } else {
        navSignIn.textContent = "會員登入";
        navSignIn.onclick = () =>
          (document.getElementById("myModal").style.display = "block");
      }
    })
    .catch((error) => {
      console.error(error);
      localStorage.removeItem("token");
      document.getElementById("signin-signup").textContent = "會員登入";
      document.getElementById("signin-signup").onclick = () =>
        (document.getElementById("myModal").style.display = "block");
    });
}

// Function to handle form submissions
export function handleForms({
  signInForm,
  signUpForm,
  signInError,
  signUpError,
  signUpSuccess,
}) {
  signUpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(signUpForm);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
    };

    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          signUpSuccess.textContent = "";
          signUpError.textContent = data.message;
        } else {
          signUpError.textContent = "";
          signUpSuccess.textContent = "註冊成功";
        }
      })
      .catch((error) => {
        signUpError.textContent = error.message;
      });
  });

  signInForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(signInForm);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    fetch("/api/user/auth", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        signInError.textContent = "";
        if (data.token) {
          localStorage.setItem("token", data.token);
          location.reload();
        } else {
          signInError.textContent = data.message;
        }
      })
      .catch((error) => {
        signInError.textContent = error.message;
      });
  });
}

export async function fetchMemberData() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token available");

  const response = await fetch("/api/user/auth", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch member data");

  const data = await response.json();
  console.log(data); // Check the structure of data here
  return data;
}

// Initialize the sign-in and sign-up functionality
document.addEventListener("DOMContentLoaded", () => {
  const { signInForm, signUpForm, signInError, signUpError, signUpSuccess } =
    handleModal();
  handleForms({
    signInForm,
    signUpForm,
    signInError,
    signUpError,
    signUpSuccess,
  });
  checkUserSignInStatus();
});
