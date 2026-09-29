/* =========================================================
   DOUGHFFY - COMPLETE ORDER SCRIPT
   ========================================================= */

const FACEBOOK_PAGE_URL = "";
const EMAILJS_PUBLIC_KEY = "jQkBcoQR4WBzsEbHv";
const EMAILJS_SERVICE_ID = "service_0jfcx89";
const EMAILJS_TEMPLATE_ID = "template_6p1bt8p";

const BOX_PRICES = { 6: 90, 12: 170, 18: 230 };

const PREMIUM = {
    frosting: {
        Caramel: 7,
        Coffee: 7,
        Matcha: 7,
        Biscoff: 7
    },
    drizzle: {
        Caramel: 2,
        Coffee: 2,
        Matcha: 2
    },
    topping: {
        Oreo: 5,
        "Biscoff Cookies": 5,
        "Graham Crackers": 5,
        Pretzels: 5,
        Peanuts: 5
    },
    powder: {
        "Matcha Powder": 5
    }
};

const INGREDIENTS = {
    frosting: [
        "Glaze",
        "Vanilla",
        "Chocolate",
        "Strawberry",
        "Ube",
        "Pandan",
        "Caramel",
        "Coffee",
        "Matcha",
        "Biscoff"
    ],

    drizzle: [
        "Vanilla",
        "Chocolate",
        "Strawberry",
        "Ube",
        "Pandan",
        "Caramel",
        "Coffee",
        "Matcha"
    ],

    topping: [
        "Oreo",
        "Biscoff Cookies",
        "Graham Crackers",
        "Pretzels",
        "Peanuts",
        "Rainbow Sprinkles",
        "Mini Chocolate Chips",
        "Heart Sprinkles",
        "Marshmallow"
    ],

    powder: [
        "Matcha Powder",
        "Ube Powder",
        "Cocoa Powder",
        "Powdered Sugar",
        "Cinnamon Sugar"
    ]
};

const FIXED_FLAVORS = {
    "Strawberry Cloud": {
        frosting: "Strawberry",
        drizzle: "Vanilla",
        topping: "Marshmallow",
        powder: ""
    },

    "Choco zag": {
        frosting: "Chocolate",
        drizzle: "Chocolate",
        topping: "",
        powder: ""
    },

    "Ube snow": {
        frosting: "Ube",
        drizzle: "",
        topping: "Powdered Sugar",
        powder: ""
    },

    "Matcha Polkadot": {
        frosting: "Matcha",
        drizzle: "Chocolate",
        topping: "Mini Chocolate Chips",
        powder: ""
    },

    "Oreo Doughffy": {
        frosting: "Vanilla",
        drizzle: "",
        topping: "Oreo",
        powder: ""
    },

    "Confetti Ring": {
        frosting: "Vanilla",
        drizzle: "",
        topping: "Rainbow Sprinkles",
        powder: ""
    },

    "Biscoff Dream": {
        frosting: "Biscoff",
        drizzle: "",
        topping: "Biscoff Cookies",
        powder: ""
    },

    "Caramel Pretzel": {
        frosting: "Caramel",
        drizzle: "",
        topping: "Pretzels",
        powder: ""
    },

    "Cinnamon Doughffy": {
        frosting: "",
        drizzle: "",
        topping: "Cinnamon Sugar",
        powder: ""
    }
};

const LOCAL_STOCK = {
    fixedFlavors: Object.fromEntries(
        Object.keys(FIXED_FLAVORS).map(x => [x, true])
    ),

    frosting: Object.fromEntries(
        INGREDIENTS.frosting.map(x => [x, true])
    ),

    drizzle: Object.fromEntries(
        INGREDIENTS.drizzle.map(x => [x, true])
    ),

    topping: Object.fromEntries(
        INGREDIENTS.topping.map(x => [x, true])
    ),

    powder: Object.fromEntries(
        INGREDIENTS.powder.map(x => [x, true])
    )
};

const state = {
    orderType: "",
    boxSize: 0,
    boxMode: "",
    mixDonuts: [],
    fixedFlavors: [],
    customGroups: [],
    fulfillment: "",
    customerName: "",
    contact: "",
    address: "",
    pickupArea: "",
    pickupLocation: "",
    pickupDate: "",
    pickupTime: "",
    notes: "",
    total: 0
};

const $ = id => document.getElementById(id);

function showScreen(id) {
    document
        .querySelectorAll(".screen")
        .forEach(screen => screen.classList.remove("active"));

    const screen = $(id);

    if (screen) {
        screen.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

window.showScreen = showScreen;

function escapeHTML(value) {
    return String(value ?? "").replace(
        /[&<>'"]/g,
        c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        }[c])
    );
}

function peso(value) {
    return `₱${Number(value || 0).toFixed(0)}`;
}

function isIngredientAvailable(category, item) {
    if (!item) return true;

    if (
        window.DOUGFFY_STOCK?.[category] &&
        Object.prototype.hasOwnProperty.call(
            window.DOUGFFY_STOCK[category],
            item
        )
    ) {
        return window.DOUGFFY_STOCK[category][item] === true;
    }

    return LOCAL_STOCK[category]?.[item] !== false;
}

function isFixedFlavorAvailable(item) {
    if (
        window.DOUGFFY_STOCK?.fixedFlavors &&
        Object.prototype.hasOwnProperty.call(
            window.DOUGFFY_STOCK.fixedFlavors,
            item
        )
    ) {
        return window.DOUGFFY_STOCK.fixedFlavors[item] === true;
    }

    return LOCAL_STOCK.fixedFlavors[item] !== false;
}

function premiumExtra(c) {
    let total = 0;

    if (PREMIUM.frosting[c.frosting]) {
        total += PREMIUM.frosting[c.frosting];
    }

    if (PREMIUM.drizzle[c.drizzle]) {
        total += PREMIUM.drizzle[c.drizzle];
    }

    if (PREMIUM.topping[c.topping1]) {
        total += PREMIUM.topping[c.topping1];
    }

    if (PREMIUM.topping[c.topping2]) {
        total += PREMIUM.topping[c.topping2];
    }

    if (PREMIUM.powder[c.powder]) {
        total += PREMIUM.powder[c.powder];
    }

    return total;
}

/* =========================================================
   INGREDIENT DROPDOWNS
   Premium prices are shown beside premium ingredients.
   ========================================================= */

function ingredientOptions(
    category,
    current = "",
    emptyLabel = "",
    allowEmpty = false,
    allowNone = false
) {
    let html = "";

    if (allowNone) {
        html += `<option value="">None</option>`;
    } else if (allowEmpty) {
        html += `<option value="">${emptyLabel || `Select ${category}`}</option>`;
    }

    INGREDIENTS[category].forEach(item => {
        const available =
            isIngredientAvailable(category, item);

        const premiumPrice =
            PREMIUM[category]?.[item];

        let displayName = item;

        if (!available) {
            displayName =
                `${item} — OUT OF STOCK`;
        } else if (premiumPrice) {
            displayName =
                `${item} (+₱${premiumPrice})`;
        } else {
            displayName =
                `${item} (Free)`;
        }

        html += `
            <option
                value="${escapeHTML(item)}"
                ${item === current ? "selected" : ""}
                ${available ? "" : "disabled"}
            >
                ${escapeHTML(displayName)}
            </option>
        `;
    });

    return html;
}

/* =========================================================
   CUSTOMIZATION HTML
   ========================================================= */

function customizationHTML(
    prefix,
    empty = false
) {
    return `
        <div class="customization-field">
            <label>Frosting</label>
            <select id="${prefix}-frosting">
                ${ingredientOptions(
                    "frosting",
                    "",
                    "Select frosting",
                    empty
                )}
            </select>
        </div>

        <div class="customization-field">
            <label>Drizzle</label>
            <select id="${prefix}-drizzle">
                ${ingredientOptions(
                    "drizzle",
                    "",
                    "Select drizzle",
                    empty
                )}
            </select>
        </div>

        <div class="customization-field">
            <label>Topping</label>
            <select id="${prefix}-topping1">
                ${ingredientOptions(
                    "topping",
                    "",
                    "Select topping",
                    empty
                )}
            </select>
        </div>

        <div class="customization-field">
            <label>
                Second Topping
                <small>(optional)</small>
            </label>

            <select id="${prefix}-topping2">
                ${ingredientOptions(
                    "topping",
                    "",
                    "",
                    false,
                    true
                )}
            </select>
        </div>

        <div class="customization-field">
            <label>Powder</label>
            <select id="${prefix}-powder">
                ${ingredientOptions(
                    "powder",
                    "",
                    "Select powder",
                    empty
                )}
            </select>
        </div>
    `;
}

function readCustomization(prefix) {
    return {
        frosting:
            $(`${prefix}-frosting`)?.value || "",

        drizzle:
            $(`${prefix}-drizzle`)?.value || "",

        topping1:
            $(`${prefix}-topping1`)?.value || "",

        topping2:
            $(`${prefix}-topping2`)?.value || "",

        powder:
            $(`${prefix}-powder`)?.value || ""
    };
}

/* =========================================================
   MIX & MATCH
   Everything is OPTIONAL.
   ========================================================= */

function mixCustomizationStarted(c) {
    return !!(
        c.frosting ||
        c.drizzle ||
        c.topping1 ||
        c.topping2 ||
        c.powder
    );
}

function updateMixProgress() {
    const total = state.boxSize;

    const customized =
        state.mixDonuts.filter(d =>
            mixCustomizationStarted(
                d.customization
            )
        ).length;

    const percent =
        total
            ? (customized / total) * 100
            : 0;

    if ($("mixProgressText")) {
        $("mixProgressText").textContent =
            `${customized}/${total} Customized`;
    }

    if ($("mixProgressFill")) {
        $("mixProgressFill").style.width =
            `${percent}%`;
    }

    /*
       Mix & Match does NOT require
       every field to be completed.
       Continue is always available
       once a box size has been selected.
    */

    setDisabled(
        $("mixContinueButton"),
        total === 0
    );
}

function updateMixTotal() {
    let total =
        BOX_PRICES[state.boxSize] || 0;

    state.mixDonuts.forEach(d => {
        total += premiumExtra(
            d.customization
        );
    });

    state.total = total;

    if ($("mixPricePreview")) {
        $("mixPricePreview").textContent =
            peso(total);
    }
}

function renderMixDonuts() {
    const container =
        $("individualCustomizationBox");

    if (!container) return;

    container.innerHTML = "";
    state.mixDonuts = [];

    for (
        let i = 0;
        i < state.boxSize;
        i++
    ) {
        const donut = {
            customization: {
                frosting: "",
                drizzle: "",
                topping1: "",
                topping2: "",
                powder: ""
            }
        };

        state.mixDonuts.push(donut);

        const card =
            document.createElement("div");

        card.className =
            "individual-card";

        card.innerHTML = `
            <div class="group-header">
                <h3>Donut ${i + 1}</h3>
                <span>
                    Customize anything you want
                </span>
            </div>

            <div class="customization-grid">
                ${customizationHTML(
                    `mix-${i}`,
                    true
                )}
            </div>
        `;

        container.appendChild(card);

        [
            "frosting",
            "drizzle",
            "topping1",
            "topping2",
            "powder"
        ].forEach(field => {
            $(`mix-${i}-${field}`)
                .addEventListener(
                    "change",
                    () => {
                        donut.customization =
                            readCustomization(
                                `mix-${i}`
                            );

                        updateMixProgress();
                        updateMixTotal();
                    }
                );
        });
    }

    updateMixProgress();
    updateMixTotal();
}

/* =========================================================
   BOX MODE
   ========================================================= */

function setDisabled(button, disabled) {
    if (!button) return;

    button.disabled = disabled;

    button.style.opacity =
        disabled ? ".45" : "1";

    button.style.cursor =
        disabled
            ? "not-allowed"
            : "pointer";
}

function setupBoxMode(mode) {
    state.boxMode = mode;

    $("byBoxModeArea").style.display =
        "none";

    $("byBoxSizeArea").style.display =
        "block";

    $("fixedFlavorArea").style.display =
        "none";

    $("customBoxArea").style.display =
        "none";
}

function setupByBoxSize(size) {
    state.boxSize =
        Number(size);

    $("byBoxSizeArea").style.display =
        "none";

    if (state.boxMode === "fixed") {
        $("fixedFlavorArea").style.display =
            "block";

        $("customBoxArea").style.display =
            "none";

        renderFixedFlavors();

    } else {
        $("customBoxArea").style.display =
            "block";

        $("fixedFlavorArea").style.display =
            "none";

        renderCustomGroups();
    }
}

/* =========================================================
   FIXED FLAVORS
   ========================================================= */

function renderFixedFlavors() {
    const container =
        $("fixedFlavorSelectors");

    container.innerHTML = "";

    state.fixedFlavors = [];

    const count =
        state.boxSize / 6;

    for (
        let i = 0;
        i < count;
        i++
    ) {
        state.fixedFlavors.push("");

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "form-group";

        let options =
            `<option value="">
                Select flavor ${i + 1}
            </option>`;

        Object.keys(FIXED_FLAVORS)
            .forEach(flavor => {
                const available =
                    isFixedFlavorAvailable(
                        flavor
                    );

                options += `
                    <option
                        value="${escapeHTML(flavor)}"
                        ${available ? "" : "disabled"}
                    >
                        ${escapeHTML(
                            available
                                ? flavor
                                : `${flavor} — OUT OF STOCK`
                        )}
                    </option>
                `;
            });

        wrapper.innerHTML = `
            <label for="fixed-${i}">
                Flavor Group ${i + 1} — 6 donuts
            </label>

            <select id="fixed-${i}">
                ${options}
            </select>
        `;

        container.appendChild(wrapper);

        $(`fixed-${i}`)
            .addEventListener(
                "change",
                e =>
                    state.fixedFlavors[i] =
                        e.target.value
            );
    }
}

/* =========================================================
   CUSTOM BOX
   These fields remain REQUIRED.
   ========================================================= */

function customizationComplete(c) {
    return !!(
        c.frosting &&
        c.drizzle &&
        c.topping1 &&
        c.powder &&

        isIngredientAvailable(
            "frosting",
            c.frosting
        ) &&

        isIngredientAvailable(
            "drizzle",
            c.drizzle
        ) &&

        isIngredientAvailable(
            "topping",
            c.topping1
        ) &&

        isIngredientAvailable(
            "powder",
            c.powder
        ) &&

        (
            !c.topping2 ||
            isIngredientAvailable(
                "topping",
                c.topping2
            )
        )
    );
}

function renderCustomGroups() {
    const container =
        $("customBoxGroups");

    container.innerHTML = "";

    state.customGroups = [];

    const count =
        state.boxSize / 6;

    for (
        let i = 0;
        i < count;
        i++
    ) {
        const group = {
            count: 6,

            customization: {
                frosting: "",
                drizzle: "",
                topping1: "",
                topping2: "",
                powder: ""
            }
        };

        state.customGroups.push(group);

        const card =
            document.createElement("div");

        card.className =
            "custom-box-group";

        card.innerHTML = `
            <div class="group-header">
                <h3>
                    Flavor Group ${i + 1}
                </h3>

                <span>
                    6 donuts
                </span>
            </div>

            <div class="customization-grid">
                ${customizationHTML(
                    `custom-${i}`,
                    true
                )}
            </div>
        `;

        container.appendChild(card);

        [
            "frosting",
            "drizzle",
            "topping1",
            "topping2",
            "powder"
        ].forEach(field => {
            $(`custom-${i}-${field}`)
                .addEventListener(
                    "change",
                    () => {
                        group.customization =
                            readCustomization(
                                `custom-${i}`
                            );

                        updateCustomProgress();
                        updateCustomTotal();
                    }
                );
        });
    }

    updateCustomProgress();
    updateCustomTotal();
}

function updateCustomProgress() {
    const completedGroups =
        state.customGroups.filter(
            g =>
                customizationComplete(
                    g.customization
                )
        ).length;

    const completed =
        completedGroups * 6;

    const total =
        state.boxSize;

    if ($("customBoxProgressText")) {
        $("customBoxProgressText")
            .textContent =
            `${completed}/${total} Customized`;
    }

    setDisabled(
        $("customBoxContinueButton"),
        completed !== total ||
        total === 0
    );
}

function updateCustomTotal() {
    let total =
        BOX_PRICES[state.boxSize] || 0;

    state.customGroups.forEach(g => {
        total +=
            premiumExtra(
                g.customization
            ) * g.count;
    });

    state.total = total;

    if ($("customBoxPricePreview")) {
        $("customBoxPricePreview")
            .textContent =
            `Total: ${peso(total)}`;
    }
}

/* =========================================================
   VALIDATION
   ========================================================= */

function validateFixed() {
    for (
        let i = 0;
        i < state.fixedFlavors.length;
        i++
    ) {
        if (!state.fixedFlavors[i]) {
            alert(
                `Please select Flavor Group ${i + 1}.`
            );

            return false;
        }

        if (
            !isFixedFlavorAvailable(
                state.fixedFlavors[i]
            )
        ) {
            alert(
                `${state.fixedFlavors[i]} is out of stock.`
            );

            return false;
        }
    }

    return true;
}

function validateCustom() {
    updateCustomProgress();

    for (
        let i = 0;
        i < state.customGroups.length;
        i++
    ) {
        if (
            !customizationComplete(
                state.customGroups[i]
                    .customization
            )
        ) {
            alert(
                `Please complete all required fields in Flavor Group ${i + 1}.`
            );

            return false;
        }
    }

    return true;
}

/* =========================================================
   ORDER SUMMARY
   ========================================================= */

function updateOrderSummary() {
    const box =
        $("orderSummary");

    if (!box) return;

    box.innerHTML = "";

    const title =
        document.createElement("div");

    title.className =
        "summary-item";

    title.innerHTML = `
        <strong>
            ${state.boxSize} mini donuts
        </strong>
        <br>
        Order style:
        ${escapeHTML(state.orderType)}
    `;

    box.appendChild(title);

    if (
        state.orderType ===
        "Mix & Match"
    ) {
        state.mixDonuts.forEach(
            (d, i) =>
                addSummaryItem(
                    box,
                    `Donut ${i + 1}`,
                    d.customization,
                    1
                )
        );
    }

    if (
        state.orderType ===
        "Fixed Flavors"
    ) {
        state.fixedFlavors.forEach(
            (flavor, i) => {
                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "summary-item";

                item.innerHTML = `
                    <strong>
                        Flavor Group ${i + 1}
                    </strong>
                    <br>
                    6 donuts —
                    ${escapeHTML(flavor)}
                `;

                box.appendChild(item);
            }
        );
    }

    if (
        state.orderType ===
        "Customized"
    ) {
        state.customGroups.forEach(
            (g, i) =>
                addSummaryItem(
                    box,
                    `Flavor Group ${i + 1} — 6 donuts`,
                    g.customization,
                    6
                )
        );
    }

    $("orderTotal").textContent =
        peso(state.total);
}

function addSummaryItem(
    box,
    title,
    c,
    quantity
) {
    const item =
        document.createElement("div");

    item.className =
        "summary-item";

    const toppings =
        [
            c.topping1,
            c.topping2
        ]
            .filter(Boolean)
            .join(" + ") ||
        "None";

    const customizationPrice =
        premiumExtra(c);

    item.innerHTML = `
        <strong>
            ${escapeHTML(title)}
        </strong>
        <br>
        Frosting:
        ${escapeHTML(c.frosting || "None")}
        <br>
        Drizzle:
        ${escapeHTML(c.drizzle || "None")}
        <br>
        Toppings:
        ${escapeHTML(toppings)}
        <br>
        Powder:
        ${escapeHTML(c.powder || "None")}
        <br>
        Customization:
        +${peso(customizationPrice)}
        per donut
    `;

    box.appendChild(item);
}

/* =========================================================
   EMAIL ORDER DETAILS
   ========================================================= */

function buildOrderDetails() {
    let text =
        `Order Type: ${state.orderType}\n` +
        `Box Size: ${state.boxSize} mini donuts\n`;

    if (
        state.orderType ===
        "Fixed Flavors"
    ) {
        state.fixedFlavors.forEach(
            (f, i) => {
                text +=
                    `Flavor Group ${i + 1}: ${f} (6 donuts)\n`;
            }
        );
    }

    if (
        state.orderType ===
        "Customized"
    ) {
        state.customGroups.forEach(
            (g, i) => {
                const c =
                    g.customization;

                text +=
                    `Flavor Group ${i + 1} (6 donuts): ` +
                    `Frosting=${c.frosting || "None"}; ` +
                    `Drizzle=${c.drizzle || "None"}; ` +
                    `Topping=${c.topping1 || "None"}; ` +
                    `Second Topping=${c.topping2 || "None"}; ` +
                    `Powder=${c.powder || "None"}\n`;
            }
        );
    }

    if (
        state.orderType ===
        "Mix & Match"
    ) {
        state.mixDonuts.forEach(
            (d, i) => {
                const c =
                    d.customization;

                text +=
                    `Donut ${i + 1}: ` +
                    `Frosting=${c.frosting || "None"}; ` +
                    `Drizzle=${c.drizzle || "None"}; ` +
                    `Topping=${c.topping1 || "None"}; ` +
                    `Second Topping=${c.topping2 || "None"}; ` +
                    `Powder=${c.powder || "None"}\n`;
            }
        );
    }

    text +=
        `Fulfillment: ${state.fulfillment}\n`;

    if (
        state.fulfillment ===
        "Delivery"
    ) {
        text +=
            `Delivery Address: ${state.address}\n` +
            `Delivery Fee: To be confirmed\n`;
    }

    if (
        state.fulfillment ===
        "Pickup"
    ) {
        text +=
            `Pickup Area: ${state.pickupArea}\n` +
            `Pickup Location: ${state.pickupLocation}\n` +
            `Pickup Date: ${state.pickupDate}\n` +
            `Pickup Time: ${state.pickupTime}\n`;
    }

    text +=
        `Total: ${peso(state.total)}`;

    return text;
}

/* =========================================================
   FULFILLMENT
   ========================================================= */

function setupFulfillment() {
    $("fulfillment")
        .addEventListener(
            "change",
            e => {
                state.fulfillment =
                    e.target.value;

                $("deliveryFields")
                    .style.display =
                    state.fulfillment ===
                    "Delivery"
                        ? "block"
                        : "none";

                $("pickupFields")
                    .style.display =
                    state.fulfillment ===
                    "Pickup"
                        ? "block"
                        : "none";
            }
        );
}

const PICKUP = {
    "Area 1": {
        days: [1, 2, 3, 4],

        locations: [
            "Jollibee / Uniqlo Acacia",
            "Gmall Bajada",
            "USeP Obrero"
        ],

        times: [
            "7:00 AM",
            "7:30 AM",
            "8:00 AM",
            "5:00 PM",
            "5:30 PM",
            "6:00 PM",
            "6:30 PM",
            "7:00 PM"
        ]
    },

    "Area 2": {
        days: [5, 6, 0],

        locations: [
            "NCCC Ma-a",
            "S&R Ma-a",
            "Jollibee Ma-a"
        ],

        times: [
            "1:00 PM",
            "1:30 PM",
            "2:00 PM",
            "2:30 PM",
            "3:00 PM",
            "3:30 PM",
            "4:00 PM",
            "4:30 PM",
            "5:00 PM",
            "5:30 PM",
            "6:00 PM",
            "6:30 PM",
            "7:00 PM",
            "7:30 PM",
            "8:00 PM"
        ]
    }
};

function setupPickup() {
    $("pickupArea").addEventListener("change", e => {
        state.pickupArea = e.target.value;

        const area = PICKUP[state.pickupArea];

        $("pickupLocation").innerHTML =
            `<option value="">Select Pickup Location</option>`;

        $("pickupTime").innerHTML =
            `<option value="">Select Time</option>`;

        if (!area) return;

        area.locations.forEach(location => {
            $("pickupLocation").insertAdjacentHTML(
                "beforeend",
                `<option value="${escapeHTML(location)}">${escapeHTML(location)}</option>`
            );
        });

        area.times.forEach(time => {
            $("pickupTime").insertAdjacentHTML(
                "beforeend",
                `<option value="${escapeHTML(time)}">${escapeHTML(time)}</option>`
            );
        });

        // Reset previous selections when changing area
        state.pickupLocation = "";
        state.pickupTime = "";
        state.pickupDate = "";

        $("pickupDate").value = "";
    });

    $("pickupLocation").addEventListener("change", e => {
        state.pickupLocation = e.target.value;
    });

    $("pickupTime").addEventListener("change", e => {
        state.pickupTime = e.target.value;
    });

    $("pickupDate").addEventListener("change", e => {
        state.pickupDate = e.target.value;

        const area = PICKUP[state.pickupArea];

        if (!area || !state.pickupDate) return;

        const day =
            new Date(`${state.pickupDate}T12:00:00`).getDay();

        if (!area.days.includes(day)) {
            alert(
                `${state.pickupArea} is not available on that date. Please choose another date.`
            );

            $("pickupDate").value = "";
            state.pickupDate = "";
        }
    });

    $("pickupDate").min =
        new Date().toISOString().split("T")[0];
}

/* =========================================================
   ORDER SCREEN
   ========================================================= */

function showOrderScreen() {
    updateOrderSummary();
    showScreen("orderScreen");
}

function generateOrderNumber() {
    return `DGH-${Math.floor(
        1000 +
        Math.random() * 9000
    )}`;
}

/* =========================================================
   EMAILJS
   ========================================================= */

async function loadEmailJS() {
    if (window.emailjs) {
        emailjs.init({
            publicKey:
                EMAILJS_PUBLIC_KEY
        });

        return;
    }

    await new Promise(
        (resolve, reject) => {
            const s =
                document.createElement(
                    "script"
                );

            s.src =
                "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";

            s.onload = resolve;
            s.onerror = reject;

            document.head.appendChild(s);
        }
    );

    emailjs.init({
        publicKey:
            EMAILJS_PUBLIC_KEY
    });
}

async function submitOrder() {
    const name =
        $("customerName")
            .value
            .trim();

    const contact =
        $("contactNumber")
            .value
            .trim();

    state.address =
        $("deliveryAddress")
            .value
            .trim();

    state.notes =
        $("notes")
            .value
            .trim();

    if (!name || !contact) {
        alert(
            "Please enter your name and contact number."
        );

        return;
    }

    if (!state.fulfillment) {
        alert(
            "Please select Delivery or Pickup."
        );

        return;
    }

    if (
        state.fulfillment ===
            "Delivery" &&
        !state.address
    ) {
        alert(
            "Please enter your delivery address."
        );

        return;
    }

    if (
        state.fulfillment ===
            "Pickup" &&
        (
            !state.pickupArea ||
            !state.pickupLocation ||
            !state.pickupDate ||
            !state.pickupTime
        )
    ) {
        alert(
            "Please complete all pickup details."
        );

        return;
    }

    state.customerName =
        name;

    state.contact =
        contact;

    const orderNumber =
        generateOrderNumber();

    const button =
        $("submitOrder");

    button.disabled = true;

    button.textContent =
        "Sending order...";

    try {
        await loadEmailJS();

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                order_number:
                    orderNumber,

                customer_name:
                    name,

                contact_number:
                    contact,

                delivery_address:
                    state.address ||
                    "N/A - Pickup",

                notes:
                    state.notes ||
                    "None",

                order_details:
                    buildOrderDetails(),

                total:
                    peso(state.total)
            }
        );

        $("orderNumber")
            .textContent =
            orderNumber;

        $("finalTotal")
            .textContent =
            peso(state.total);

        $("confirmationDetails")
            .innerHTML = `
                <strong>Customer:</strong>
                ${escapeHTML(name)}
                <br>

                <strong>Contact:</strong>
                ${escapeHTML(contact)}
                <br><br>

                <strong>Fulfillment:</strong>
                ${escapeHTML(state.fulfillment)}
                <br>

                ${
                    state.fulfillment ===
                    "Delivery"

                    ? `
                        <strong>Address:</strong>
                        ${escapeHTML(state.address)}
                        <br>

                        <strong>Delivery Fee:</strong>
                        To be confirmed
                    `

                    : `
                        <strong>Pickup Area:</strong>
                        ${escapeHTML(state.pickupArea)}
                        <br>

                        <strong>Pickup Location:</strong>
                        ${escapeHTML(state.pickupLocation)}
                        <br>

                        <strong>Pickup Date:</strong>
                        ${escapeHTML(state.pickupDate)}
                        <br>

                        <strong>Pickup Time:</strong>
                        ${escapeHTML(state.pickupTime)}
                    `
                }

                <br><br>

                <strong>Order:</strong>
                ${state.boxSize} mini donuts
                <br>

                <strong>Order Type:</strong>
                ${escapeHTML(state.orderType)}

                ${
                    state.notes
                        ? `
                            <br><br>
                            <strong>Notes:</strong>
                            ${escapeHTML(state.notes)}
                        `
                        : ""
                }
            `;

        showScreen(
            "confirmationScreen"
        );

    } catch (error) {
        console.error(
            "Doughffy EmailJS error:",
            error
        );

        alert(
            "We couldn't send the order right now. Please check your internet connection and try again."
        );

    } finally {
        button.disabled =
            false;

        button.textContent =
            "🍩 Place My Order";
    }
}

/* =========================================================
   RESET
   ========================================================= */

function resetOrder() {
    location.reload();
}

/* =========================================================
   STOCK UPDATES
   ========================================================= */

function refreshVisibleStock() {
    if (
        state.orderType ===
        "Customized"
    ) {
        state.customGroups
            .forEach((g, i) => {
                if (
                    $(
                        `custom-${i}-frosting`
                    )
                ) {
                    g.customization =
                        readCustomization(
                            `custom-${i}`
                        );
                }
            });

        updateCustomProgress();
        updateCustomTotal();
    }

    if (
        state.orderType ===
        "Mix & Match"
    ) {
        state.mixDonuts
            .forEach((d, i) => {
                if (
                    $(
                        `mix-${i}-frosting`
                    )
                ) {
                    d.customization =
                        readCustomization(
                            `mix-${i}`
                        );
                }
            });

        updateMixProgress();
        updateMixTotal();
    }
}

window.addEventListener(
    "doughffyStockUpdated",
    refreshVisibleStock
);

/* =========================================================
   PAGE STARTUP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        showScreen(
            "welcomeScreen"
        );

        $("yesButton")
            .addEventListener(
                "click",
                () =>
                    showScreen(
                        "styleScreen"
                    )
            );

        $("menuButton")
            .addEventListener(
                "click",
                () =>
                    showScreen(
                        "menuScreen"
                    )
            );

        $("noButton")
            .addEventListener(
                "click",
                () =>
                    showScreen(
                        "notTodayScreen"
                    )
            );

        $("menuBackButton")
            .addEventListener(
                "click",
                () =>
                    showScreen(
                        "welcomeScreen"
                    )
            );

        $("menuOrderButton")
            .addEventListener(
                "click",
                () =>
                    showScreen(
                        "styleScreen"
                    )
            );

        $("goBackButton")
            .addEventListener(
                "click",
                () =>
                    showScreen(
                        "welcomeScreen"
                    )
            );

        $("mixButton")
            .addEventListener(
                "click",
                () => {
                    state.orderType =
                        "Mix & Match";

                    showScreen(
                        "mixSizeScreen"
                    );
                }
            );

        $("singleButton")
            .addEventListener(
                "click",
                () => {
                    state.orderType =
                        "One Box";

                    $("byBoxModeArea")
                        .style.display =
                        "block";

                    $("byBoxSizeArea")
                        .style.display =
                        "none";

                    $("fixedFlavorArea")
                        .style.display =
                        "none";

                    $("customBoxArea")
                        .style.display =
                        "none";

                    showScreen(
                        "singleFlavorScreen"
                    );
                }
            );

        document
            .querySelectorAll(
                "[data-screen]"
            )
            .forEach(button =>
                button.addEventListener(
                    "click",
                    () =>
                        showScreen(
                            button.dataset
                                .screen
                        )
                )
            );

        document
            .querySelectorAll(
                ".mix-size-button"
            )
            .forEach(button =>
                button.addEventListener(
                    "click",
                    () => {
                        state.boxSize =
                            Number(
                                button.dataset
                                    .size
                            );

                        renderMixDonuts();

                        showScreen(
                            "builderScreen"
                        );
                    }
                )
            );

        document
            .querySelectorAll(
                ".box-mode-button"
            )
            .forEach(button =>
                button.addEventListener(
                    "click",
                    () =>
                        setupBoxMode(
                            button.dataset
                                .boxMode
                        )
                )
            );

        document
            .querySelectorAll(
                ".box-size-button"
            )
            .forEach(button =>
                button.addEventListener(
                    "click",
                    () =>
                        setupByBoxSize(
                            button.dataset
                                .size
                        )
                )
            );

        /* =================================================
           MIX & MATCH CONTINUE

           NO REQUIRED FIELDS.
           The customer can continue even
           if every customization is blank.
           ================================================= */

        $("mixContinueButton")
            .addEventListener(
                "click",
                () => {
                    state.orderType =
                        "Mix & Match";

                    showOrderScreen();
                }
            );

        $("fixedFlavorContinueButton")
            .addEventListener(
                "click",
                () => {
                    if (!validateFixed()) {
                        return;
                    }

                    state.orderType =
                        "Fixed Flavors";

                    state.total =
                        BOX_PRICES[
                            state.boxSize
                        ] || 0;

                    showOrderScreen();
                }
            );

        $("customBoxContinueButton")
            .addEventListener(
                "click",
                () => {
                    if (!validateCustom()) {
                        return;
                    }

                    state.orderType =
                        "Customized";

                    showOrderScreen();
                }
            );

        $("fulfillment").value = "";

        setupFulfillment();
        setupPickup();

        $("submitOrder")
            .addEventListener(
                "click",
                submitOrder
            );

        $("anotherOrderButton")
            .addEventListener(
                "click",
                resetOrder
            );

        $("homeButton")
            .addEventListener(
                "click",
                resetOrder
            );

        $("facebookButton")
            .addEventListener(
                "click",
                () => {
                    if (
                        FACEBOOK_PAGE_URL
                    ) {
                        window.open(
                            FACEBOOK_PAGE_URL,
                            "_blank"
                        );
                    } else {
                        alert(
                            "Please take a screenshot of your confirmation and send it to Doughffy through Facebook."
                        );
                    }
                }
            );

        document
            .querySelectorAll(
                '[data-action="back-to-box-size"]'
            )
            .forEach(button =>
                button.addEventListener(
                    "click",
                    () => {
                        $("fixedFlavorArea")
                            .style.display =
                            "none";

                        $("customBoxArea")
                            .style.display =
                            "none";

                        $("byBoxSizeArea")
                            .style.display =
                            "block";
                    }
                )
            );
    }
);