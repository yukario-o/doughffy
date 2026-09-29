import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDK1oqMhnXUZi3L5fgGO-v27a6ogjNiivU",
    authDomain: "doughffy-cdaec.firebaseapp.com",
    databaseURL: "https://doughffy-cdaec-default-rtdb.firebaseio.com",
    projectId: "doughffy-cdaec",
    storageBucket: "doughffy-cdaec.firebasestorage.app",
    messagingSenderId: "196981796644",
    appId: "1:196981796644:web:68fe55f72e78b2f3a34db1"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/*
    Default stock:
    Everything starts as available.

    Firebase only needs to store items
    that have been changed.
*/

const DEFAULT_STOCK = {
    fixedFlavors: {
        "Strawberry Cloud": true,
        "Choco zag": true,
        "Ube snow": true,
        "Matcha Polkadot": true,
        "Oreo Doughffy": true,
        "Confetti Ring": true,
        "Biscoff Dream": true,
        "Caramel Pretzel": true,
        "Cinnamon Doughfty": true
    },

    frosting: {
        "Glaze": true,
        "Vanilla": true,
        "Chocolate": true,
        "Strawberry": true,
        "Ube": true,
        "Pandan": true,
        "Caramel": true,
        "Coffee": true,
        "Matcha": true,
        "Biscoff": true
    },

    drizzle: {
        "Vanilla": true,
        "Chocolate": true,
        "Strawberry": true,
        "Ube": true,
        "Pandan": true,
        "Caramel": true,
        "Coffee": true,
        "Matcha": true
    },

    topping: {
        "Oreo": true,
        "Biscoff Cookies": true,
        "Graham Crackers": true,
        "Pretzels": true,
        "Peanuts": true,
        "Rainbow Sprinkles": true,
        "Mini Chocolate Chips": true,
        "Heart Sprinkles": true,
        "Marshmallow": true
    },

    powder: {
        "Matcha Powder": true,
        "Ube Powder": true,
        "Cocoa Powder": true,
        "Powdered Sugar": true,
        "Cinnamon Sugar": true
    }
};

function createDefaultStock() {
    return JSON.parse(JSON.stringify(DEFAULT_STOCK));
}

const stockReference = ref(database, "stock");

onValue(stockReference, (snapshot) => {

    const remoteStock = snapshot.val() || {};

    const mergedStock = createDefaultStock();

    /*
        Merge Firebase stock changes
        over the default values.
    */

    Object.keys(mergedStock).forEach((category) => {

        if (
            remoteStock[category] &&
            typeof remoteStock[category] === "object"
        ) {

            Object.keys(mergedStock[category]).forEach((item) => {

                if (
                    Object.prototype.hasOwnProperty.call(
                        remoteStock[category],
                        item
                    )
                ) {

                    mergedStock[category][item] =
                        remoteStock[category][item] === true;

                }

            });

        }

    });

    /*
        Make the stock available
        to the existing script.js
    */

    window.DOUGFFY_STOCK = mergedStock;

    /*
        Tell the website that
        Firebase stock has updated.
    */

    window.dispatchEvent(
        new CustomEvent("doughffyStockUpdated", {
            detail: mergedStock
        })
    );

    console.log(
        "Doughffy stock updated:",
        mergedStock
    );
});