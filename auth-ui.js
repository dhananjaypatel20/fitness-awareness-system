// auth-ui.js - Handles global navbar auth state and profile modal

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName") || "User";
    
    // Inject Profile Modal HTML
    const modalHTML = `
      <div class="modal-overlay" id="profile-modal">
        <div class="modal-content">
          <button class="modal-close" id="profile-close">&times;</button>
          <div class="modal-title">Your Profile</div>
          <div id="profile-msg" style="text-align:center; margin-bottom:10px; font-size:14px; font-weight:600;"></div>
          <form class="modal-form" id="profile-form">
            <input type="text" id="prof-name" placeholder="Name" required>
            <input type="email" id="prof-email" placeholder="Email">
            <input type="tel" id="prof-mobile" placeholder="Mobile Number" required>
            <input type="password" id="prof-password" placeholder="New Password (optional)">
            <button type="submit">Save Changes</button>
          </form>
          <button class="logout-btn" id="logout-btn">Log Out</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const profileModal = document.getElementById("profile-modal");
    const profileClose = document.getElementById("profile-close");
    const profileForm = document.getElementById("profile-form");
    const logoutBtn = document.getElementById("logout-btn");

    profileClose.addEventListener("click", () => profileModal.classList.remove("active"));
    
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userMobile");
        window.location.href = "login.html";
    });

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("prof-name").value;
        const email = document.getElementById("prof-email").value;
        const mobile = document.getElementById("prof-mobile").value;
        const password = document.getElementById("prof-password").value;
        const msgEl = document.getElementById("profile-msg");
        msgEl.textContent = "Saving...";
        msgEl.style.color = "#2563eb";

        try {
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, mobile, password: password || undefined })
            });
            const data = await res.json();
            if (res.ok) {
                msgEl.textContent = "Profile updated successfully!";
                msgEl.style.color = "green";
                localStorage.setItem("userName", data.name);
                localStorage.setItem("userMobile", data.mobile);
                updateNavbar(data.name);
            } else {
                msgEl.textContent = data.message || "Failed to update profile";
                msgEl.style.color = "red";
            }
        } catch(err) {
            msgEl.textContent = "Server error!";
            msgEl.style.color = "red";
        }
    });

    const updateNavbar = (name) => {
        const navBtns = document.querySelectorAll(".hero-btn");
        navBtns.forEach(btn => {
            if (btn.textContent.includes("Join Us") || btn.textContent.includes("Profile")) {
                if (token) {
                    btn.innerHTML = `<i class="fas fa-user"></i> ${name}`;
                    btn.onclick = async () => {
                        // Open profile modal
                        profileModal.classList.add("active");
                        // Fetch current data
                        try {
                            const res = await fetch('http://localhost:5000/api/auth/profile', {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const data = await res.json();
                            if(res.ok) {
                                document.getElementById("prof-name").value = data.name || "";
                                document.getElementById("prof-email").value = data.email || "";
                                document.getElementById("prof-mobile").value = data.mobile || "";
                            }
                        } catch(e) {}
                    };
                } else {
                    btn.textContent = "Join Us";
                    btn.onclick = () => window.location.href = "login.html";
                }
            }
        });
    };

    updateNavbar(userName);
});
