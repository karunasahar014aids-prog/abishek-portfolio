/* =========================================================
   ABISHEK STUDIO - PHOTOGRAPHY ADMIN PANEL
   Supabase powered
   ========================================================= */


/* ================= SUPABASE CONFIG ================= */

const SUPABASE_URL = "YOUR_EXISTING_SUPABASE_URL";

const SUPABASE_ANON_KEY = "YOUR_EXISTING_SUPABASE_ANON_KEY";


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


    if (!password) return;


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
   DASHBOARD
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

    if (
        document.querySelector(
            ".dashboard"
        )
    ) {

        document.querySelector(
            ".dashboard"
        ).style.display = "block";

        return;
    }


    /* Hide login */

    const loginWrapper =
        document.querySelector(
            ".login-wrapper"
        );


    if (loginWrapper) {

        loginWrapper.style.display =
            "none";

    }


    /* Create dashboard */

    const dashboard =
        document.createElement("div");


    dashboard.className =
        "dashboard";


    dashboard.innerHTML = `

        <!-- Dashboard Header -->

        <div class="dashboard-top">

            <div>

                <span class="dashboard-eyebrow">
                    ABISHEK STUDIO
                </span>

                <h1>
                    Photography Dashboard
                </h1>

                <p>
                    Manage your visual portfolio,
                    photographs and published work.
                </p>

            </div>


            <button
                class="logout-btn"
                onclick="logout()">

                <span>↪</span>
                Logout

            </button>

        </div>


        <!-- Statistics -->

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


        <!-- Main Dashboard Grid -->

        <div class="dashboard-grid">


            <!-- Add Photo -->

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


                    <div class="form-field">

                        <label>
                            CATEGORY
                        </label>

                        <select id="posterCategory">

                            <option value="posters">
                                Posters
                            </option>

                            <option value="covers">
                                Covers
                            </option>

                            <option value="street">
                                Street
                            </option>

                            <option value="other">
                                Other
                            </option>

                        </select>

                    </div>


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


                    <div class="form-field">

                        <label>
                            IMAGE
                        </label>

                        <input
                            type="file"
                            id="posterImage"
                            accept="image/*"
                        >

                    </div>


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


                <!-- Image Preview -->

                <div
                    id="imagePreview"
                    class="image-preview">
                </div>


                <!-- Buttons -->

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


            <!-- Manage Photos -->

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


    main.scrollIntoView({
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
            document.createElement(
                "div"
            );


        item.className =
            "poster-item";


        const image =
            poster.image_url || "";


        const title =
            poster.title ||
            "Untitled";


        const category =
            poster.category ||
            "Other";


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

                    ${escapeHTML(
                        category
                    )}

                </div>


                <h3>

                    ${escapeHTML(
                        title
                    )}

                </h3>


                <p>

                    ${
                        escapeHTML(
                            poster.location ||
                            "Location not added"
                        )
                    }

                </p>


                <div class="poster-meta">

                    <span>
                        ${escapeHTML(
                            poster.date ||
                            "—"
                        )}
                    </span>

                    <span>
                        Order:
                        ${poster.display_order ?? 0}
                    </span>

                </div>


                <div class="status">

                    <span
                        class="${
                            poster.published
                            ? "published"
                            : "draft"
                        }">

                        ${
                            poster.published
                            ? "Published"
                            : "Draft"
                        }

                    </span>

                </div>

            </div>


            <div class="poster-actions">

                <button
                    class="edit-btn"
                    onclick="editPoster('${poster.id}')">

                    Edit

                </button>


                <button
                    class="publish-btn"
                    onclick="togglePublish(
                        '${poster.id}',
                        ${poster.published}
                    )">

                    ${
                        poster.published
                        ? "Unpublish"
                        : "Publish"
                    }

                </button>


                <button
                    class="delete-btn"
                    onclick="deletePoster('${poster.id}')">

                    Delete

                </button>

            </div>

        `;


        posterList.appendChild(item);

    });

}


/* =====================================================
   SAVE PHOTOGRAPH
   ===================================================== */

async function savePoster() {

    if (!supabaseClient) {

        alert(
            "Supabase is not configured."
        );

        return;
    }


    const title =
        document.getElementById(
            "posterTitle"
        ).value.trim();


    const category =
        document.getElementById(
            "posterCategory"
        ).value;


    const location =
        document.getElementById(
            "posterLocation"
        ).value.trim();


    const date =
        document.getElementById(
            "posterDate"
        ).value.trim();


    const description =
        document.getElementById(
            "posterDescription"
        ).value.trim();


    const imageInput =
        document.getElementById(
            "posterImage"
        );


    if (!title) {

        alert(
            "Please enter photo title."
        );

        return;
    }


    try {

        let imageUrl = null;


        /* ================= IMAGE UPLOAD ================= */

        if (
            imageInput.files &&
            imageInput.files.length > 0
        ) {

            const file =
                imageInput.files[0];


            const fileName =
                Date.now() +
                "-" +
                file.name.replace(
                    /\s+/g,
                    "-"
                );


            const { error: uploadError } =
                await supabaseClient
                    .storage
                    .from("posters")
                    .upload(
                        fileName,
                        file,
                        {
                            cacheControl:
                                "3600",

                            upsert:
                                false
                        }
                    );


            if (uploadError) {

                throw uploadError;

            }


            const { data: publicData } =
                supabaseClient
                    .storage
                    .from("posters")
                    .getPublicUrl(
                        fileName
                    );


            imageUrl =
                publicData.publicUrl;

        }


        /* ================= EDIT ================= */

        if (currentPosterId) {

            const updateData = {

                title:
                    title,

                category:
                    category,

                location:
                    location,

                date:
                    date,

                description:
                    description,

                updated_at:
                    new Date().toISOString()

            };


            if (imageUrl) {

                updateData.image_url =
                    imageUrl;

            }


            const { error } =
                await supabaseClient
                    .from("posters")
                    .update(
                        updateData
                    )
                    .eq(
                        "id",
                        currentPosterId
                    );


            if (error) {

                throw error;

            }


            alert(
                "Photograph updated successfully."
            );

        }


        /* ================= ADD ================= */

        else {

            const {
                data: lastPoster,
                error: orderError
            } =
                await supabaseClient
                    .from("posters")
                    .select(
                        "display_order"
                    )
                    .order(
                        "display_order",
                        {
                            ascending:
                                false
                        }
                    )
                    .limit(1);


            if (orderError) {

                throw orderError;

            }


            let order = 1;


            if (
                lastPoster &&
                lastPoster.length > 0
            ) {

                order =
                    Number(
                        lastPoster[0]
                            .display_order
                    ) + 1;

            }


            const { error } =
                await supabaseClient
                    .from("posters")
                    .insert({

                        title:
                            title,

                        category:
                            category,

                        location:
                            location,

                        date:
                            date,

                        description:
                            description,

                        image_url:
                            imageUrl,

                        display_order:
                            order,

                        published:
                            false

                    });


            if (error) {

                throw error;

            }


            alert(
                "Photograph added successfully."
            );

        }


        cancelEdit();

        await loadPosters();

    }


    catch (error) {

        console.error(error);


        alert(
            "Error saving photograph: " +
            error.message
        );

    }

}


/* =====================================================
   EDIT PHOTOGRAPH
   ===================================================== */

async function editPoster(id) {

    if (!supabaseClient) {

        return;
    }


    try {

        const { data, error } =
            await supabaseClient
                .from("posters")
                .select("*")
                .eq(
                    "id",
                    id
                )
                .single();


        if (error) {

            throw error;

        }


        currentPosterId =
            id;


        document.getElementById(
            "posterTitle"
        ).value =
            data.title || "";


        document.getElementById(
            "posterCategory"
        ).value =
            data.category || "posters";


        document.getElementById(
            "posterLocation"
        ).value =
            data.location || "";


        document.getElementById(
            "posterDate"
        ).value =
            data.date || "";


        document.getElementById(
            "posterDescription"
        ).value =
            data.description || "";


        document.getElementById(
            "formTitle"
        ).textContent =
            "Edit Photograph";


        document.getElementById(
            "cancelEditBtn"
        ).style.display =
            "inline-flex";


        if (data.image_url) {

            document.getElementById(
                "imagePreview"
            ).innerHTML = `

                <div class="current-image">

                    <img
                        src="${escapeHTML(
                            data.image_url
                        )}"
                        alt="Current photograph"
                    >

                    <span>
                        Current Photograph
                    </span>

                </div>

            `;

        }


        const dashboard =
            document.querySelector(
                ".dashboard"
            );


        if (dashboard) {

            dashboard.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }


    catch (error) {

        console.error(error);


        alert(
            "Unable to edit photograph."
        );

    }

}


/* =====================================================
   CANCEL EDIT
   ===================================================== */

function cancelEdit() {

    currentPosterId = null;


    const fields = [

        "posterTitle",
        "posterLocation",
        "posterDate",
        "posterDescription"

    ];


    fields.forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.value = "";

        }

    });


    const category =
        document.getElementById(
            "posterCategory"
        );


    if (category) {

        category.value =
            "posters";

    }


    const image =
        document.getElementById(
            "posterImage"
        );


    if (image) {

        image.value = "";

    }


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (preview) {

        preview.innerHTML = "";

    }


    const formTitle =
        document.getElementById(
            "formTitle"
        );


    if (formTitle) {

        formTitle.textContent =
            "Add New Photograph";

    }


    const cancelButton =
        document.getElementById(
            "cancelEditBtn"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }

}


/* =====================================================
   DELETE PHOTOGRAPH
   ===================================================== */

async function deletePoster(id) {

    if (!supabaseClient) {

        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this photograph?"
        );


    if (!confirmDelete) {

        return;
    }


    try {

        const { error } =
            await supabaseClient
                .from("posters")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            throw error;

        }


        alert(
            "Photograph deleted successfully."
        );


        await loadPosters();

    }


    catch (error) {

        console.error(error);


        alert(
            "Delete failed: " +
            error.message
        );

    }

}


/* =====================================================
   IMAGE PREVIEW
   ===================================================== */

document.addEventListener(
    "change",
    function(event) {

        if (
            event.target.id !==
            "posterImage"
        ) {

            return;
        }


        const file =
            event.target.files[0];


        if (!file) {

            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function(e) {

                const preview =
                    document.getElementById(
                        "imagePreview"
                    );


                if (!preview) {

                    return;
                }


                preview.innerHTML = `

                    <div class="current-image">

                        <img
                            src="${e.target.result}"
                            alt="Image preview"
                        >

                        <span>
                            Image Preview
                        </span>

                    </div>

                `;

            };


        reader.readAsDataURL(file);

    }
);


/* =====================================================
   UPDATE STATISTICS
   ===================================================== */

function updateStats(posters) {

    const total =
        posters.length;


    const published =
        posters.filter(
            poster =>
                poster.published === true
        ).length;


    const drafts =
        total - published;


    const totalElement =
        document.getElementById(
            "totalPosters"
        );


    const publishedElement =
        document.getElementById(
            "publishedPosters"
        );


    const draftElement =
        document.getElementById(
            "draftPosters"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (publishedElement) {

        publishedElement.textContent =
            published;

    }


    if (draftElement) {

        draftElement.textContent =
            drafts;

    }

}


/* =====================================================
   PUBLISH / UNPUBLISH
   ===================================================== */

async function togglePublish(
    id,
    currentStatus
) {

    if (!supabaseClient) {

        return;
    }


    try {

        const { error } =
            await supabaseClient
                .from("posters")
                .update({

                    published:
                        !currentStatus,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            throw error;

        }


        await loadPosters();

    }


    catch (error) {

        console.error(error);


        alert(
            "Unable to change publish status."
        );

    }

}


/* =====================================================
   SECURITY HELPER
   ===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   CHECK EXISTING SESSION
   ===================================================== */

async function checkSession() {

    if (!supabaseClient) {

        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(error);

        return;

    }


    if (
        data &&
        data.session
    ) {

        showDashboard();

        await loadPosters();

    }

}


/* =====================================================
   START
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        try {

            await loadSupabase();

            await checkSession();

        }


        catch (error) {

            console.error(error);


            const message =
                document.getElementById(
                    "message"
                );


            if (message) {

                message.textContent =
                    "Unable to initialize admin panel.";

            }

        }

    }
);
