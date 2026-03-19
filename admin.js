import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);

/* =========================
   🔹 EDITING STATE
========================= */
let editingProjectId = null;
let editingCertificateId = null;

document.addEventListener("DOMContentLoaded", () => {

    const loginSection = document.getElementById("loginSection");
    const adminPanel = document.getElementById("adminPanel");

    // 🔐 LOGIN
    document.getElementById("loginBtn").addEventListener("click", async () => {
        const email = document.getElementById("adminEmail").value.trim();
        const password = document.getElementById("adminPassword").value.trim();

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error(error);
            alert("Login Failed");
        }
    });

    // 🔓 LOGOUT
    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await signOut(auth);
    });

    // 👀 AUTH STATE
    onAuthStateChanged(auth, (user) => {
    const loginTitle = document.getElementById("adminLoginTitle");

    if (user) {
        loginSection.style.display = "none";
        adminPanel.style.display = "block";
        if (loginTitle) loginTitle.style.display = "none";

        loadMessages();
        loadProjects();
        loadCertificates();
        loadSkills();
    } else {
        loginSection.style.display = "block";
        adminPanel.style.display = "none";
        if (loginTitle) loginTitle.style.display = "block";
    }
});

});

    // ➕ ADD PROJECT
    // ➕ ADD PROJECT
document.getElementById("addProjectBtn").addEventListener("click", async () => {

    const title = document.getElementById("projectTitle").value.trim();
    const shortDesc = document.getElementById("shortDesc").value.trim();
    const description = document.getElementById("projectFullDesc").value.trim();
    const techStack = document.getElementById("projectTechStack").value.trim();
    const dataset = document.getElementById("projectDataset").value.trim();
    const github = document.getElementById("projectGithub").value.trim();
    const paper = document.getElementById("projectPaper").value.trim();
    const screenshotsInput = document.getElementById("projectScreenshots").value.trim();
    const fileName = document.getElementById("projectFileName").value.trim();

    if (!title || !description) {
        alert("Title and Description are required");
        return;
    }

    const screenshots = screenshotsInput
        ? screenshotsInput.split(",").map(s => s.trim())
        : [];

    try {

        // 🔁 UPDATE MODE
        if (editingProjectId) {

            await updateDoc(doc(db, "projects", editingProjectId), {
                title,
                shortDesc,
                description,
                techStack: techStack || null,
                dataset: dataset || null,
                github: github || null,
                paper: paper || null,
                screenshots,
                fileName: fileName || null,
                updatedAt: new Date()
            });

            editingProjectId = null;
            document.getElementById("addProjectBtn").textContent = "Add Project";
            loadProjects();
            alert("Project Updated");
            return;
        }

        // ➕ ADD MODE (THIS WAS MISSING)
        await addDoc(collection(db, "projects"), {
            title,
            shortDesc,
            description,
            techStack: techStack || null,
            dataset: dataset || null,
            github: github || null,
            paper: paper || null,
            screenshots,
            fileName: fileName || null,
            createdAt: new Date()
        });

        alert("Project Added Successfully");

        // Clear form
        document.getElementById("projectTitle").value = "";
        document.getElementById("shortDesc").value = "";
        document.getElementById("projectFullDesc").value = "";
        document.getElementById("projectTechStack").value = "";
        document.getElementById("projectDataset").value = "";
        document.getElementById("projectGithub").value = "";
        document.getElementById("projectPaper").value = "";
        document.getElementById("projectScreenshots").value = "";
        document.getElementById("projectFileName").value = "";

        loadProjects();

    } catch (error) {
        console.error(error);
        alert("Error adding project");
    }

});
// ➕ ADD CERTIFICATE
document.getElementById("addCertBtn").addEventListener("click", async () => {

    const title = document.getElementById("certTitle").value.trim();
    const issuer = document.getElementById("certIssuer").value.trim();
    const fileName = document.getElementById("certFileName").value.trim();

    if (!title || !issuer || !fileName) {
        alert("Fill all fields");
        return;
    }

    // 🔁 UPDATE MODE
    if (editingCertificateId) {

        await updateDoc(doc(db, "certificates", editingCertificateId), {
            title,
            issuer,
            fileName,
            updatedAt: new Date()
        });

        editingCertificateId = null;
        document.getElementById("addCertBtn").textContent = "Add Certificate";

        loadCertificates();
        alert("Certificate Updated");
        return;
    }

    // ➕ ADD MODE
    await addDoc(collection(db, "certificates"), {
        title,
        issuer,
        fileName,
        createdAt: new Date()
    });

    alert("Certificate Added");

    document.getElementById("certTitle").value = "";
    document.getElementById("certIssuer").value = "";
    document.getElementById("certFileName").value = "";

    loadCertificates();
});

    // ➕ ADD SKILL (NEW STRUCTURE)
    document.getElementById("addSkillBtn").addEventListener("click", async () => {
        const name = document.getElementById("skillName").value.trim();
        const icon = document.getElementById("skillIcon").value.trim();

        if (!name) {
            alert("Enter skill name");
            return;
        }

        await addDoc(collection(db, "skills"), {
            name,
            icon,
            createdAt: new Date()
        });

        alert("Skill Added");
        document.getElementById("skillName").value = "";
        document.getElementById("skillIcon").value = "";
        loadSkills();
    });


// 📩 LOAD MESSAGES
async function loadMessages() {
    const container = document.getElementById("messagesContainer");
    if (!container) return;

    container.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "messages"));

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        container.innerHTML += `
            <div class="message-card">
                <button class="message-delete" onclick="deleteMessage('${id}')">
                    Delete
                </button>

                <div class="message-name">
                    ${data.name || "No Name"}
                </div>

                <div class="message-email">
                    ${data.email || "No Email"}
                </div>

                <div class="message-text">
                    ${data.message || ""}
                </div>
            </div>
        `;
    });
}

// 📦 LOAD PROJECTS (Admin View)
async function loadProjects() {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const container = document.getElementById("adminProjectsContainer");
    if (!container) return;

    container.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        container.innerHTML += `
            <div class="project-admin-card">
                <div class="project-admin-content">
                    <div class="project-admin-title">
                        ${data.title}
                    </div>
                    <div class="project-admin-file">
                        ${data.fileName || "No file attached"}
                    </div>
                </div>

                <div class="project-admin-actions">
                    <button class="edit-btn" onclick="editProject('${id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteProject('${id}')">Delete</button>
                </div>
            </div>
        `;
    });
}


// 📜 LOAD CERTIFICATES (Admin View - Compact Grid)
async function loadCertificates() {
    const querySnapshot = await getDocs(collection(db, "certificates"));
    const container = document.getElementById("adminCertificatesContainer");
    if (!container) return;

    container.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        container.innerHTML += `
            <div class="certificate-admin-card">
                <div class="certificate-admin-content">
                    <div class="certificate-admin-title">
                        ${data.title}
                    </div>
                    <div class="certificate-admin-issuer">
                        ${data.issuer || "No issuer"}
                    </div>
                </div>

                <div class="certificate-admin-actions">
                    <button class="edit-btn" onclick="editCertificate('${id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteCertificate('${id}')">Delete</button>
                </div>
            </div>
        `;
    });
}


// 📚 LOAD SKILLS (NEW STRUCTURE)
async function loadSkills() {
    const container = document.getElementById("adminSkillsContainer");
    if (!container) return;

    container.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "skills"));

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        container.innerHTML += `
            <div class="skill-admin-card">
                <span>${data.icon || "⚡"}</span>
                <span>${data.name}</span>
                <button onclick="deleteSkill('${id}')">×</button>
            </div>
        `;
    });
}

// ❌ DELETE FUNCTIONS
window.deleteProject = async function(id) {
    await deleteDoc(doc(db, "projects", id));
    alert("Project Deleted");
    loadProjects();
};

window.deleteCertificate = async function(id) {
    await deleteDoc(doc(db, "certificates", id));
    alert("Certificate Deleted");
    loadCertificates();
};

window.deleteSkill = async function(id) {
    await deleteDoc(doc(db, "skills", id));
    alert("Skill Deleted");
    loadSkills();
};

window.editProject = async function(id) {

    const docSnap = await getDoc(doc(db, "projects", id));
    if (!docSnap.exists()) return;

    const data = docSnap.data();

    document.getElementById("projectTitle").value = data.title || "";
    document.getElementById("shortDesc").value = data.shortDesc || "";
    document.getElementById("projectFullDesc").value = data.description || "";
    document.getElementById("projectTechStack").value = data.techStack || "";
    document.getElementById("projectDataset").value = data.dataset || "";
    document.getElementById("projectGithub").value = data.github || "";
    document.getElementById("projectPaper").value = data.paper || "";
    document.getElementById("projectScreenshots").value =
        data.screenshots ? data.screenshots.join(", ") : "";
    document.getElementById("projectFileName").value = data.fileName || "";

    editingProjectId = id;

    document.getElementById("addProjectBtn").textContent = "Update Project";
};


window.editCertificate = async function(id) {

    const docSnap = await getDoc(doc(db, "certificates", id));
    if (!docSnap.exists()) return;

    const data = docSnap.data();

    document.getElementById("certTitle").value = data.title || "";
    document.getElementById("certIssuer").value = data.issuer || "";
    document.getElementById("certFileName").value = data.fileName || "";

    editingCertificateId = id;

    document.getElementById("addCertBtn").textContent = "Update Certificate";
};


window.deleteMessage = async function(id) {
    await deleteDoc(doc(db, "messages", id));
    loadMessages();
};