import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   🔹 FIREBASE INIT
========================= */

const firebaseConfig = {
    apiKey: "AIzaSyC3VAj6pHUPZOrOVoWti64EZgVt0wDEqYE",
    authDomain: "parthajit-portfolio.firebaseapp.com",
    projectId: "parthajit-portfolio",
    storageBucket: "parthajit-portfolio.firebasestorage.app",
    messagingSenderId: "368597265378",
    appId: "1:368597265378:web:8b1352aac8da9dd2ada7bb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   🔹 DOM READY
========================= */
let isProjectGridView = false;
document.addEventListener('DOMContentLoaded', () => {



     /* =========================
       🔹 THEME TOGGLE (ADD HERE)
    ========================== */

    const toggleBtn = document.getElementById("themeToggle");

    if (toggleBtn) {

        // Load saved theme
        if (localStorage.getItem("theme") === "light") {
            document.body.classList.add("light-mode");
            toggleBtn.textContent = "☀️";
        }

        // Toggle click
        toggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");

            if (document.body.classList.contains("light-mode")) {
                localStorage.setItem("theme", "light");
                toggleBtn.textContent = "☀️";
            } else {
                localStorage.setItem("theme", "dark");
                toggleBtn.textContent = "🌙";
            }
        });
    }

    /* =========================
       🔹 MODAL VIEWER
    ========================== */

    const modal = document.getElementById("fileModal");

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target.id === "fileModal") {
                closeModal();
            }
        });
    }

    function closeModal() {
        const modal = document.getElementById("fileModal");
        const modalBody = document.getElementById("modalBody");
        if (!modal || !modalBody) return;
        modal.style.display = "none";
        modalBody.innerHTML = "";
    }

    window.openFileModal = function(filePath) {

        const modal = document.getElementById("fileModal");
        const modalBody = document.getElementById("modalBody");

        if (!modal || !modalBody) return;

        modal.style.display = "flex";
        modalBody.innerHTML = "";

        const extension = filePath.split('.').pop().toLowerCase();

        if (extension === "pdf") {
            const iframe = document.createElement("iframe");
            iframe.src = filePath;
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            modalBody.appendChild(iframe);
        } else {
            const img = document.createElement("img");
            img.src = filePath;
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            img.style.objectFit = "contain";
            modalBody.appendChild(img);
        }
    };

    const closeBtn = document.getElementById("closeModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    /* =========================
       🔹 PROJECTS
    ========================== */

    async function loadProjects() {
        const container = document.getElementById("projectsContainer");
        if (!container) return;

        const querySnapshot = await getDocs(collection(db, "projects"));
        container.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const fileName = data.fileName || null;

            container.innerHTML += `
                <div class="project-item" onclick="window.location.href='project.html?id=${doc.id}'">
                    <h3>${data.title}</h3>
                    <p>${data.shortDesc || ""}</p>
                    ${
                        fileName
                        ? `
                        <div class="file-preview" onclick="event.stopPropagation(); openFileModal('assets/projects/${fileName}')">
                            ${getFilePreviewHTML(fileName, 'assets/projects/')}
                        </div>
                        `
                        : ""
                    }
                </div>
            `;
        });

        start3DCarousel();
    }

    let carouselInterval = null; // 🔥 GLOBAL
    


function start3DCarousel() {

    // ❌ STOP if grid mode is ON
    if (isProjectGridView) return;

    const items = document.querySelectorAll(".project-item");
    const carousel = document.getElementById("carouselView");
    if (!items.length || !carousel) return;

    let current = 0;

    function updateCarousel() {

        // ❌ STOP updating if grid mode ON
        if (isProjectGridView) return;

        items.forEach((item, index) => {
            item.classList.remove("active", "prev", "next", "hidden");

            if (index === current) item.classList.add("active");
            else if (index === (current + 1) % items.length) item.classList.add("next");
            else if (index === (current - 1 + items.length) % items.length) item.classList.add("prev");
            else item.classList.add("hidden");
        });
    }

    function startAutoSlide() {
        carouselInterval = setInterval(() => {

            // ❌ STOP if grid mode ON
            if (isProjectGridView) return;

            current = (current + 1) % items.length;
            updateCarousel();

        }, 3000);
    }

    function stopAutoSlide() {
        clearInterval(carouselInterval);
    }

    updateCarousel();
    startAutoSlide();

    carousel.addEventListener("mouseenter", stopAutoSlide);
    carousel.addEventListener("mouseleave", startAutoSlide);
}


function stopCarouselAndShowAll() {
    clearInterval(carouselInterval);

    const items = document.querySelectorAll(".project-item");

    items.forEach(item => {
        item.classList.remove("active", "prev", "next", "hidden");
    });
}

    /* =========================
       🔹 CERTIFICATES
    ========================== */

    async function loadCertificates() {
        const container = document.getElementById("certificatesContainer");
        if (!container) return;

        const querySnapshot = await getDocs(collection(db, "certificates"));
        container.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const fileName = data.fileName || null;

            container.innerHTML += `
                <div class="certificate-item">
                    <h3>${data.title}</h3>
                    <p>Issued by ${data.issuer}</p>

                    ${
                        fileName
                        ? `
                        <div class="file-preview" onclick="openFileModal('assets/certificates/${fileName}')">
                            ${getFilePreviewHTML(fileName, 'assets/certificates/')}
                        </div>
                        `
                        : `<p style="color:gray;">No file uploaded</p>`
                    }
                </div>
            `;
        });

        startCertCarousel();
    }

    function startCertCarousel() {
        const track = document.getElementById("certificatesContainer");
        const items = document.querySelectorAll(".certificate-item");
        const prevBtn = document.getElementById("certPrev");
        const nextBtn = document.getElementById("certNext");

        if (!items.length || !prevBtn || !nextBtn) return;

        let index = 0;
        const visibleCount = 3;
        const itemWidth = items[0].offsetWidth + 30;

        function updatePosition() {
            track.style.transform = `translateX(-${index * itemWidth}px)`;
        }

        nextBtn.addEventListener("click", () => {
            if (index < items.length - visibleCount) index++;
            updatePosition();
        });

        prevBtn.addEventListener("click", () => {
            if (index > 0) index--;
            updatePosition();
        });
    }

    /* =========================
       🔹 SKILLS
    ========================== */

    async function loadSkills() {
        const container = document.getElementById("skillsContainer");
        if (!container) return;

        const querySnapshot = await getDocs(collection(db, "skills"));
        container.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            container.innerHTML += `
                <div class="skill-pill">
                    <span>${data.icon || "⚡"}</span>
                    <span>${data.name}</span>
                </div>
            `;
        });
    }



/* =========================
   🏆 ACHIEVEMENTS
========================== */

async function loadAchievements() {
    const container = document.getElementById("achievementsContainer");
    if (!container) return;

    const snapshot = await getDocs(collection(db, "achievements"));
    container.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();

        container.innerHTML += `
            <div class="achievement-card">
                <div class="ach-icon">${data.icon || "🏆"}</div>
                <h3>${data.title}</h3>
                <p class="ach-main">${data.subtitle || ""}</p>
                <p class="ach-sub">${data.description || ""}</p>
            </div>
        `;
    });
}



/* =========================
   🔬 RESEARCH
========================== */

async function loadResearch() {
    const container = document.getElementById("researchContainer");
    if (!container) return;

    const snapshot = await getDocs(collection(db, "research"));
    container.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();

        container.innerHTML += `
            <div class="research-card">
                <div class="research-icon">${data.icon || "📄"}</div>
                <h3>${data.title}</h3>
                <p class="research-main">${data.subtitle || ""}</p>
                <p class="research-sub">${data.description || ""}</p>

                <div class="research-links">
                    ${data.paper ? `<a href="${data.paper}" class="btn-small" target="_blank">View Paper</a>` : ""}
                    ${data.github ? `<a href="${data.github}" class="btn-small" target="_blank">GitHub</a>` : ""}
                </div>
            </div>
        `;
    });
}





    /* =========================
       🔹 CONTACT FORM
    ========================== */

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('input[name="name"]').value;
            const email = contactForm.querySelector('input[name="email"]').value;
            const message = contactForm.querySelector('textarea[name="message"]').value;

            try {
                await addDoc(collection(db, "messages"), {
                    name,
                    email,
                    message,
                    createdAt: new Date()
                });

                alert("Message sent successfully!");
                contactForm.reset();
            } catch (error) {
                console.error(error);
                alert("Error sending message.");
            }
        });
    }

    /* =========================
       🔹 FILE PREVIEW
    ========================== */

    function getFilePreviewHTML(fileName, basePath) {
        if (!fileName) return "";

        const extension = fileName.split('.').pop().toLowerCase();

        if (extension === "pdf") {
            return `
                <div class="preview-wrapper">
                    <iframe src="${basePath + fileName}" width="100%" height="200px"></iframe>
                </div>
            `;
        } else {
            return `
                <div class="preview-wrapper">
                    <img src="${basePath + fileName}" width="100%" height="200px" style="object-fit:cover;border-radius:10px;">
                </div>
            `;
        }
    }

  
   
    /* =========================
       🔹 INIT
    ========================== */

    async function init() {
    await loadProjects();
    await loadCertificates();
    await loadSkills();
    await loadAchievements();
    await loadResearch();

    setupProjectToggle();   // ✅ ADD THIS
    setupCertToggle();      // (optional, since yours works)
    setupProjectToggle();
}

    init();
    


    
});


document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       🔥 PROJECT TOGGLE
    ========================== */

    const toggleBtn = document.getElementById("toggleViewBtn");
const projectsContainer = document.getElementById("projectsContainer");
const carousel = document.getElementById("carouselView");

if (toggleBtn && projectsContainer && carousel) {
    let isGridView = false;

    toggleBtn.addEventListener("click", () => {
        isGridView = !isGridView;

        if (isGridView) {
            // 👉 disable carousel behavior
            carousel.classList.add("grid-mode");

            projectsContainer.classList.add("projects-grid");
            toggleBtn.textContent = "Show Less";
        } else {
            carousel.classList.remove("grid-mode");

            projectsContainer.classList.remove("projects-grid");
            toggleBtn.textContent = "See All";
        }
    });
}


    /* =========================
       🔥 CERTIFICATE TOGGLE
    ========================== */

    const certBtn = document.getElementById("certToggleBtn");
    const certContainer = document.getElementById("certificatesContainer");

    if (certBtn && certContainer) {
        let isGrid = false;

        certBtn.addEventListener("click", () => {
            isGrid = !isGrid;

            certContainer.classList.toggle("cert-grid");

            certBtn.textContent = isGrid ? "Show Less" : "See All";
        });
    }


    function setupProjectToggle() {
    const toggleBtn = document.getElementById("toggleViewBtn");
    const container = document.getElementById("projectsContainer");

    if (!toggleBtn || !container) return;

    toggleBtn.addEventListener("click", () => {

        isProjectGridView = !isProjectGridView;

        if (isProjectGridView) {

            // 🛑 STOP carousel
            clearInterval(carouselInterval);

            // 🧹 REMOVE ALL CLASSES
            document.querySelectorAll(".project-item").forEach(item => {
                item.classList.remove("active", "prev", "next", "hidden");
            });

            // 🎯 SHOW GRID
            container.classList.add("projects-grid");

            toggleBtn.textContent = "Show Less";

        } else {

            // 🔄 BACK TO CAROUSEL
            container.classList.remove("projects-grid");

            start3DCarousel();

            toggleBtn.textContent = "See All";
        }
    });
}



});