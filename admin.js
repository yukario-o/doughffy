// =========================================
// DOUGHFFY STOCK MANAGER
// FIREBASE CONNECTION
// =========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    onValue,
    set
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {
    apiKey: "AIzaSyDK1oqMhnXUZi3L5fgGO-v27a6ogjNiivU",
    authDomain: "doughffy-cdaec.firebaseapp.com",
    databaseURL: "https://doughffy-cdaec-default-rtdb.firebaseio.com",
    projectId: "doughffy-cdaec",
    storageBucket: "doughffy-cdaec.firebasestorage.app",
    messagingSenderId: "196981796644",
    appId: "1:196981796644:web:68fe55f72e78b2f3a34db1",
    measurementId: "G-PW2T809MFY"
};


// =========================================
// INITIALIZE FIREBASE
// =========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);


// =========================================
// STOCK ITEMS
// =========================================

const STOCK_ITEMS = {

    fixedFlavors: [
        "Strawberry Cloud",
        "Choco zag",
        "Ube snow",
        "Matcha Polkadot",
        "Oreo Doughffy",
        "Confetti Ring",
        "Biscoff Dream",
        "Caramel Pretzel",
        "Cinnamon Doughfty"
    ],

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


// =========================================
// ELEMENTS
// =========================================

const loginScreen = document.getElementById("loginScreen");

const adminPanel = document.getElementById("adminPanel");

const loginForm = document.getElementById("loginForm");

const loginEmail = document.getElementById("loginEmail");

const loginPassword = document.getElementById("loginPassword");

const loginError = document.getElementById("loginError");

const logoutButton = document.getElementById("logoutButton");

const saveMessage = document.getElementById("saveMessage");


// =========================================
// LOGIN
// =========================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    loginError.textContent = "";

    const email = loginEmail.value.trim();

    const password = loginPassword.value;


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    } catch (error) {

        console.error(error);

        loginError.textContent =
            "Login failed. Please check your email and password.";

    }

});


// =========================================
// AUTH STATE
// =========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        loginScreen.classList.add("hidden");

        adminPanel.classList.remove("hidden");

        loadStock();

    } else {

        adminPanel.classList.add("hidden");

        loginScreen.classList.remove("hidden");

    }

});


// =========================================
// LOG OUT
// =========================================

logoutButton.addEventListener("click", async () => {

    await signOut(auth);

});


// =========================================
// LOAD STOCK FROM FIREBASE
// =========================================

function loadStock() {

    const stockReference = ref(database, "stock");

    onValue(stockReference, (snapshot) => {

        const stockData = snapshot.val() || {};

        renderStockList(
            "fixedFlavorsList",
            "fixedFlavors",
            stockData.fixedFlavors || {}
        );

        renderStockList(
            "frostingsList",
            "frosting",
            stockData.frosting || {}
        );

        renderStockList(
            "drizzlesList",
            "drizzle",
            stockData.drizzle || {}
        );

        renderStockList(
            "toppingsList",
            "topping",
            stockData.topping || {}
        );

        renderStockList(
            "powdersList",
            "powder",
            stockData.powder || {}
        );

    });

}


// =========================================
// RENDER STOCK LIST
// =========================================

function renderStockList(
    containerId,
    category,
    savedStock
) {

    const container = document.getElementById(containerId);

    const items = STOCK_ITEMS[category];

    container.innerHTML = "";


    items.forEach((item, index) => {

        const available =
            savedStock[item] !== false;


        const itemElement = document.createElement("div");

        itemElement.className = "stock-item";


        itemElement.innerHTML = `

            <span class="stock-name">
                ${item}
            </span>

            <div class="stock-status">

                <span
                    class="status-text"
                    id="${category}-status-${index}"
                >
                    ${available
                        ? "AVAILABLE"
                        : "OUT OF STOCK"
                    }
                </span>

                <label class="stock-toggle">

                    <input
                        type="checkbox"
                        ${available ? "checked" : ""}
                        data-category="${category}"
                        data-item="${item}"
                    >

                    <span class="toggle-slider"></span>

                </label>

            </div>

        `;


        const checkbox =
            itemElement.querySelector("input");


        checkbox.addEventListener(
            "change",
            () => {

                updateStock(
                    category,
                    item,
                    checkbox.checked
                );

            }
        );


        container.appendChild(itemElement);

    });

}


// =========================================
// UPDATE STOCK
// =========================================

async function updateStock(
    category,
    item,
    available
) {

    try {

        const stockReference =
            ref(
                database,
                `stock/${category}/${item}`
            );


        await set(
            stockReference,
            available
        );


        showSaveMessage(
            `${item} is now ${
                available
                    ? "AVAILABLE"
                    : "OUT OF STOCK"
            }.`
        );


    } catch (error) {

        console.error(error);

        showSaveMessage(
            "Could not save the stock change."
        );

    }

}


// =========================================
// SAVE MESSAGE
// =========================================

function showSaveMessage(message) {

    saveMessage.textContent = message;


    setTimeout(() => {

        saveMessage.textContent = "";

    }, 2500);

}