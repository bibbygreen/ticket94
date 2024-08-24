export async function verifyUserSignInToken() {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const response = await fetch("/api/user/auth", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        console.error("Server response:", await response.text());
        throw new Error("Token verification failed");
      }
      return await response.json();
    } catch (error) {
      console.error("Error during token verification:", error);
      throw error;
    }
  }
}

export async function checkSigninStatus() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/"; // 如果沒有token，跳轉回首頁
      return;
    }

    const response = await fetch("/api/user/auth", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to verify token");
    }

    const userData = await response.json();
    console.log("User is logged in:", userData);
  } catch (error) {
    console.error("User not logged in or token invalid:", error);
    window.location.href = "/"; // 如果token無效，跳轉回首頁
  }
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

document.addEventListener("DOMContentLoaded", function () {
  const headlineElement = document.querySelector(".headline");

  headlineElement.addEventListener("click", () => {
    window.location.href = "/";
  });

  const token = localStorage.getItem("token");

  const signinLink = document.getElementById("signin-link");
  const profileLink = document.getElementById("profile-link");
  const logoutLink = document.getElementById("logout-link");

  if (token) {
    //登入
    signinLink.style.display = "none";
    profileLink.style.display = "block";
    logoutLink.style.display = "block";

    profileLink.addEventListener("click", function () {
      window.location.href = "/profile";
    });

    logoutLink.addEventListener("click", function () {
      localStorage.removeItem("token");
      showToast("您已登出");
      setTimeout(() => {
        window.location.href = "/";
      }, 3000); // 3秒後跳轉
    });
  } else {
    // 未登入
    signinLink.style.display = "block";
    profileLink.style.display = "none";
    logoutLink.style.display = "none";

    signinLink.addEventListener("click", function () {
      window.location.href = "/signin";
    });
  }
});

// 處理登入表單提交
const signInForm = document.getElementById("signInForm");
if (signInForm) {
  signInForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;

    try {
      const response = await fetch("/api/user/auth", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        showToast("登入成功！");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000); // 3秒後跳轉
      } else {
        showToast("登入失敗：" + data.error);
      }
    } catch (error) {
      console.error("發生錯誤：", error);
      showToast("登入時發生錯誤");
    }
  });
}

// 處理註冊表單提交
const signUpForm = document.getElementById("signUpForm");
if (signUpForm) {
  signUpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const phone = document.getElementById("signup-phone").value;
    const password = document.getElementById("signup-password").value;

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("註冊成功！您現在可以登入");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 3000); // 3秒後跳轉
      } else {
        showToast("註冊失敗：" + data.error);
      }
    } catch (error) {
      console.error("發生錯誤：", error);
      showToast("註冊時發生錯誤");
    }
  });
}

export function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000); // 3秒後消失
}
