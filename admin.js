/* =========================================================
   ABISHEK PORTFOLIO - ADMIN PANEL
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
        "Logging in...";

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
            "Login successful!";

        showDashboard();

        loadPosters();

    }

    catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "Login failed.";

    }

}


/* ================= SHOW DASHBOARD ================= */

function showDashboard() {

    const loginBox =
        document.querySelector(".login-box");

    if (loginBox) {

        loginBox.style.display =
            "none";

    }


    let dashboard =
        document.querySelector(".dashboard");


    if (!dashboard) {

        dashboard =
            document.createElement("div");

        dashboard.className =
            "dashboard";


        dashboard.innerHTML = `

            <div class="dashboard-header">

                <h2>Admin Dashboard</h2>

                <button
                    class="logout-btn"
                    onclick="logout()">
                    Logout
                </button>

            </div>


            <div class="stats">

                <div class="stat-card">

                    <h3>Total Posters</h3>

                    <p id="totalPosters">
                        0
                    </p>

                </div>


                <div class="stat-card">

                    <h3>Published</h3>

                    <p id="publishedPosters">
                        0
                    </p>

                </div>


                <div class="stat-card">

                    <h3>Drafts</h3>

                    <p id="draftPosters">
                        0
                    </p>

                </div>

            </div>


            <div class="add-poster">

                <h2 id="formTitle">
                    Add New Poster
                </h2>


                <input
                    type="text"
                    id="posterTitle"
                    placeholder="Poster Title">


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


                <input
                    type="text"
                    id="posterLocation"
                    placeholder="Location">


                <input
                    type="text"
                    id="posterDate"
                    placeholder="Year">


                <textarea
                    id="posterDescription"
                    placeholder="Description">
                </textarea>


                <input
                    type="file"
                    id="posterImage"
                    accept="image/*">


                <div
                    id="imagePreview"
                    style="margin-bottom:15px;">
                </div>


                <button
                    onclick="savePoster()">
                    Save Poster
                </button>


                <button
                    onclick="cancelEdit()"
                    id="cancelEditBtn"
                    style="display:none;">
                    Cancel
                </button>

            </div>


            <div class="poster-list">

                <h2>
                    Manage Posters
                </h2>

                <div id="posterList">
                    Loading posters...
                </div>

            </div>

        `;


        const container =
            document.querySelector(
                ".admin-container"
            );


        if (container) {

            container.appendChild(
                dashboard
            );

        }

    }


    dashboard.style.display =
        "block";

}


/* ================= LOGOUT ================= */

async function logout() {

    if (supabaseClient) {

        await supabaseClient.auth.signOut();

    }

    location.reload();

}


/* ================= LOAD POSTERS ================= */

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

            posterList.innerHTML =
                "<p>Unable to load posters.</p>";

        }

    }

}


/* ================= DISPLAY POSTERS ================= */

function displayPosters(posters) {

    const posterList =
        document.getElementById(
            "posterList"
        );


    if (!posterList) {

        return;

    }


    if (!posters ||
        posters.length === 0) {

        posterList.innerHTML =
            "<p>No posters found.</p>";

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


        item.innerHTML = `

            <img
                src="${escapeHTML(
                    poster.image_url || ""
                )}"
                alt="${escapeHTML(
                    poster.title || ""
                )}">


            <div class="poster-info">

                <h3>
                    ${escapeHTML(
                        poster.title ||
                        "Untitled"
                    )}
                </h3>


                <p>
                    Category:
                    ${escapeHTML(
                        poster.category || ""
                    )}
                </p>


                <p>
                    Location:
                    ${escapeHTML(
                        poster.location || ""
                    )}
                </p>


                <p>
                    Order:
                    ${poster.display_order ?? 0}
                </p>


                <p>
                    Status:
                    ${
                        poster.published
                        ? "Published"
                        : "Draft"
                    }
                </p>

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


/* ================= SAVE POSTER ================= */

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
            "Please enter poster title."
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
                file.name
                    .replace(/\s+/g, "-");


            const filePath =
                fileName;


            const { error: uploadError } =
                await supabaseClient
                    .storage
                    .from("posters")
                    .upload(
                        filePath,
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
                        filePath
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
                "Poster updated successfully."
            );

        }


        /* ================= ADD ================= */

        else {

            const { data: lastPoster,
                    error: orderError } =
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
                "Poster added successfully."
            );

        }


        cancelEdit();

        await loadPosters();

    }

    catch (error) {

        console.error(error);

        alert(
            "Error saving poster: " +
            error.message
        );

    }

}


/* ================= EDIT POSTER ================= */

async function editPoster(id) {

    if (!supabaseClient) {

        return;

    }


    try {

        const { data, error } =
            await supabaseClient
                .from("posters")
                .select("*")
                .eq("id", id)
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
            "Edit Poster";


        document.getElementById(
            "cancelEditBtn"
        ).style.display =
            "inline-block";


        if (data.image_url) {

            document.getElementById(
                "imagePreview"
            ).innerHTML = `

                <img
                    src="${escapeHTML(
                        data.image_url
                    )}"
                    style="
                        width:150px;
                        border-radius:10px;
                    "
                >

                <p>Current Image</p>

            `;

        }


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to edit poster."
        );

    }

}


/* ================= CANCEL EDIT ================= */

function cancelEdit() {

    currentPosterId = null;


    const title =
        document.getElementById(
            "posterTitle"
        );

    if (title) {

        title.value = "";

    }


    const category =
        document.getElementById(
            "posterCategory"
        );

    if (category) {

        category.value =
            "posters";

    }


    const location =
        document.getElementById(
            "posterLocation"
        );

    if (location) {

        location.value = "";

    }


    const date =
        document.getElementById(
            "posterDate"
        );

    if (date) {

        date.value = "";

    }


    const description =
        document.getElementById(
            "posterDescription"
        );

    if (description) {

        description.value = "";

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
            "Add New Poster";

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


/* ================= DELETE POSTER ================= */

async function deletePoster(id) {

    if (!supabaseClient) {

        return;

    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this poster?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const { error } =
            await supabaseClient
                .from("posters")
                .delete()
                .eq("id", id);


        if (error) {

            throw error;

        }


        alert(
            "Poster deleted successfully."
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


/* ================= IMAGE PREVIEW ================= */

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

                    <img
                        src="${e.target.result}"
                        style="
                            width:150px;
                            border-radius:10px;
                            display:block;
                            margin-bottom:5px;
                        "
                    >

                    <p>
                        Image Preview
                    </p>

                `;

            };


        reader.readAsDataURL(file);

    }
);


/* ================= UPDATE STATISTICS ================= */

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


/* ================= PUBLISH / UNPUBLISH ================= */

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


/* ================= SECURITY HELPER ================= */

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


/* ================= CHECK EXISTING SESSION ================= */

async function checkSession() {

    if (!supabaseClient) {

        return;

    }


    const { data, error } =
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


/* ================= START ================= */

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
