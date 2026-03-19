import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

function getProjectId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadProject() {

    const id = getProjectId();
    const container = document.getElementById("projectDetails");

    if (!id) {
        container.innerHTML = "<h2>No project selected</h2>";
        return;
    }

    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        container.innerHTML = "<h2>Project not found</h2>";
        return;
    }

    const data = docSnap.data();

    container.innerHTML = `
        <h1 style="text-align:center; margin-bottom:40px;">${data.title}</h1>

        ${data.description ? `
            <div class="project-section">
                <h3>Description</h3>
                <p>${data.description}</p>
            </div>
        ` : ""}

        <div class="meta-grid">
            ${data.techStack ? `
                <div class="project-section">
                    <h3>Tech Stack</h3>
                    <p>${data.techStack}</p>
                </div>
            ` : ""}

            ${data.dataset ? `
                <div class="project-section">
                    <h3>Dataset</h3>
                    <p>${data.dataset}</p>
                </div>
            ` : ""}
        </div>

        ${Array.isArray(data.screenshots) && data.screenshots.length > 0 ? `
            <div class="project-section">
                <h3>Results</h3>
                <div class="result-gallery">
                    ${data.screenshots.map(img =>
                        `<img src="assets/projects/${img}" class="result-img">`
                    ).join("")}
                </div>
            </div>
        ` : ""}

        <div class="button-row">
            ${data.github ? `
                <a href="${data.github}" target="_blank" class="btn">GitHub</a>
            ` : ""}

            ${data.paper ? `
                <a href="${data.paper}" target="_blank" class="btn">Research Paper</a>
            ` : ""}
        </div>
    `;
}

loadProject();