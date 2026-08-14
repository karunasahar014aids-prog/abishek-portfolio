/* =========================================================
   ABISHEK STUDIO - PHOTOGRAPHY ADMIN PANEL
   Supabase Powered
   ========================================================= */


/* ================= SUPABASE CONFIG ================= */

const SUPABASE_URL =
    "https://jaryhmtzzassnzomtsch.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA";


let supabaseClient = null;
let currentPosterId = null;


/* ================= LOAD SUPABASE ================= */

function loadSupabase() {

    return new Promise((resolve, reject) => {

        if (window.supabase) {

            initializeSupabase();

            resolve();

            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = () => {

            initializeSupabase();

            resolve();

        };

        script.onerror = () => {

            reject(
                new Error("Supabase library failed to load.")
            );

        };

        document.head.appendChild(script);

    });

}


/* ================= INITIALIZE SUPABASE ================= */

function initializeSupabase() {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

}


/* ================= LOGIN ================= */

async function login() {

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const message =
        document.getElementById("message");


    if (!emailInput || !passwordInput) {

        return;
    }


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        return;
    }


    if (!supabaseClient) {

        message.textContent =
            "Supabase is not configured.";

        return;
    }


    message.textContent =
        "Authenticating...";


    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            throw error;

        }


        message.textContent =
            "Login successful.";


        showDashboard();

        await loadPosters();

    }

    catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "Login failed.";

    }

}


/* ================= PASSWORD TOGGLE ================= */

function togglePassword() {

    const password =
        document.getElementById("password");

    const button =
        document.querySelector(".password-toggle");


    if (!password) {

        return;
    }


    if (password.type === "password") {

        password.type = "text";

        if (button) {

            button.textContent = "◉";

        }

    }

    else {

        password.type = "password";

        if (button) {

            button.textContent = "◉";

        }

    }

}


/* =====================================================
   SHOW DASHBOARD
   ===================================================== */

function showDashboard() {

    const main =
        document.querySelector(".admin-main");


    if (!main) {

        console.error(
            "Admin main container not found."
        );

        return;
    }


    /* Prevent duplicate dashboard */

    const existingDashboard =
        document.querySelector(".dashboard");


    if (existingDashboard) {

        existingDashboard.style.display =
            "block";

        return;
    }


    /* Hide login */

    const loginWrapper =
        document.querySelector(".login-wrapper");


    if (loginWrapper) {

        loginWrapper.style.display =
            "none";

    }


    /* Create Dashboard */

    const dashboard =
        document.createElement("div");


    dashboard.className =
        "dashboard";


    dashboard.innerHTML = `

        <!-- DASHBOARD HEADER -->

        <div class="dashboard-top">

            <div>

                <span class="dashboard-eyebrow">
                    ABISHEK STUDIO
                </span>

                <h1>
                    Photography Dashboard
                </h1>

                <p>
                    Manage your photographs,
                    galleries and published work.
                </p>

            </div>


            <button
                class="logout-btn"
                onclick="logout()">

                <span>↪</span>

                Logout

            </button>

        </div>


        <!-- STATISTICS -->

        <div class="stats">


            <div class="stat-card">

                <div class="stat-icon">
                    ◉
                </div>

                <div>

                    <span>
                        TOTAL PHOTOS
                    </span>

                    <strong id="totalPosters">
                        0
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon">
                    ✓
                </div>

                <div>

                    <span>
                        PUBLISHED
                    </span>

                    <strong id="publishedPosters">
                        0
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon">
                    ◇
                </div>

                <div>

                    <span>
                        DRAFTS
                    </span>

                    <strong id="draftPosters">
                        0
                    </strong>

                </div>

            </div>


        </div>


        <!-- DASHBOARD GRID -->

        <div class="dashboard-grid">


            <!-- ADD PHOTOGRAPH -->

            <section class="add-poster">


                <div class="panel-heading">

                    <div>

                        <span>
                            PHOTOGRAPHY
                        </span>

                        <h2 id="formTitle">
                            Add New Photograph
                        </h2>

                    </div>


                    <div class="heading-symbol">
                        +
                    </div>

                </div>


                <div class="form-grid">


                    <!-- TITLE -->

                    <div class="form-field full">

                        <label>
                            PHOTO TITLE
                        </label>

                        <input
                            type="text"
                            id="posterTitle"
                            placeholder="Example: Golden Hour Portrait"
                        >

                    </div>


                    <!-- CATEGORY -->

                    <div class="form-field">

                        <label>
                            CATEGORY
                        </label>

                        <select id="posterCategory">

                            <option value="posters">
                                Portraits
                            </option>

                            <option value="covers">
                                Nature
                            </option>

                            <option value="street">
                                Street
                            </option>

                            <option value="other">
                                Events
                            </option>

                        </select>

                    </div>


                    <!-- LOCATION -->

                    <div class="form-field">

                        <label>
                            LOCATION
                        </label>

                        <input
                            type="text"
                            id="posterLocation"
                            placeholder="Nagapattinam, Tamil Nadu"
                        >

                    </div>


                    <!-- YEAR -->

                    <div class="form-field">

                        <label>
                            YEAR
                        </label>

                        <input
                            type="text"
                            id="posterDate"
                            placeholder="2026"
                        >

                    </div>


                    <!-- IMAGE -->

                    <div class="form-field">

                        <label>
                            PHOTOGRAPH
                        </label>

                        <input
                            type="file"
                            id="posterImage"
                            accept="image/*"
                        >

                    </div>


                    <!-- DESCRIPTION -->

                    <div class="form-field full">

                        <label>
                            DESCRIPTION
                        </label>

                        <textarea
                            id="posterDescription"
                            placeholder="Write a short description about this photograph..."
                        ></textarea>

                    </div>


                </div>


                <!-- IMAGE PREVIEW -->

                <div
                    id="imagePreview"
                    class="image-preview">
                </div>


                <!-- FORM BUTTONS -->

                <div class="form-actions">


                    <button
                        class="save-btn"
                        onclick="savePoster()">

                        <span>
                            Save Photograph
                        </span>

                        <b>
                            →
                        </b>

                    </button>


                    <button
                        class="cancel-btn"
                        onclick="cancelEdit()"
                        id="cancelEditBtn"
                        style="display:none;">

                        Cancel

                    </button>


                </div>


            </section>


            <!-- MANAGE PHOTOGRAPHS -->

            <section class="poster-list">


                <div class="panel-heading">

                    <div>

                        <span>
                            COLLECTION
                        </span>

                        <h2>
                            Manage Photographs
                        </h2>

                    </div>


                    <div class="collection-count">
                        LIVE
                    </div>

                </div>


                <div id="posterList">

                    <div class="loading-state">

                        Loading photographs...

                    </div>

                </div>


            </section>


        </div>

    `;


    main.appendChild(dashboard);


    dashboard.scrollIntoView({
        behavior: "smooth"
    });

}


/* ================= LOGOUT ================= */

async function logout() {

    if (supabaseClient) {

        await supabaseClient.auth.signOut();

    }


    location.reload();

}


/* =====================================================
   LOAD PHOTOGRAPHS
   ===================================================== */

async function loadPosters() {

    if (!supabaseClient) {

        return;
    }


    const posterList =
        document.getElementById(
            "posterList"
        );


    try {

        const { data, error } =
            await supabaseClient
                .from("posters")
                .select("*")
                .order(
                    "display_order",
                    {
                        ascending: true
                    }
                );


        if (error) {

            throw error;

        }


        displayPosters(data);

        updateStats(data);

    }

    catch (error) {

        console.error(error);


        if (posterList) {

            posterList.innerHTML = `

                <div class="empty-state">

                    <strong>
                        Unable to load photographs
                    </strong>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Database connection failed."
                        )}
                    </p>

                </div>

            `;

        }

    }

}


/* =====================================================
   DISPLAY PHOTOGRAPHS
   ===================================================== */

function displayPosters(posters) {

    const posterList =
        document.getElementById(
            "posterList"
        );


    if (!posterList) {

        return;
    }


    if (
        !posters ||
        posters.length === 0
    ) {

        posterList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ◉
                </div>

                <strong>
                    No photographs yet
                </strong>

                <p>
                    Add your first photograph
                    using the form.
                </p>

            </div>

        `;

        return;
    }


    posterList.innerHTML = "";


    posters.forEach(poster => {


        const item =
            document.createElement("div");


        item.className =
            "poster-item";


        const image =
            poster.image_url || "";


        const title =
            poster.title || "Untitled";


        const category =
            poster.category || "Other";


        item.innerHTML = `

            <div class="poster-image">

                ${
                    image

                    ?

                    `<img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(title)}"
                    >`

                    :

                    `<div class="no-image">
                        No Image
                    </div>`
                }

            </div>


            <div class="poster-info">


                <div class="poster-category">

                    ${escapeHTML(category)}

                </div>


                <h3>

                    ${escapeHTML(title)}

                </h3>


                <p>

                    ${escapeHTML(
                        poster.location ||
                        "Location not added"
                    )}

                </p>


                <
