/* =========================================
   PRINTZY - COMPLETE JAVASCRIPT
========================================= */

const UPI_ID = "8695185199@pytes";
const DELIVERY_CHARGE = 20;

const PRINT_PRICES = {
    BW: 1,
    COLOUR: 5
};

const BINDING_PRICES = {
    None: 0,
    Stapling: 5,
    "Spiral Binding": 30,
    "Comb Binding": 25,
    Softcover: 40,
    Hardcover: 80
};

/* =========================================
   COMMON FUNCTIONS
========================================= */

function getOrders() {
    try {
        const orders = JSON.parse(
            localStorage.getItem("printzyOrders") || "[]"
        );

        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        console.error("Could not load orders:", error);
        return [];
    }
}

function saveOrders(orders) {
    try {
        localStorage.setItem(
            "printzyOrders",
            JSON.stringify(orders)
        );

        return true;
    } catch (error) {
        console.error("Could not save orders:", error);
        return false;
    }
}

function generateOrderID() {
    return "PZ-" + Date.now().toString().slice(-8);
}

function formatMoney(amount) {
    return "₹" + Number(amount || 0).toFixed(2);
}

function showMessage(element, message, color = "#dc2626") {
    if (!element) return;

    element.textContent = message;
    element.style.color = color;
}

/* =========================================
   STUDENT LOGIN
   This is a basic demo, not secure authentication.
========================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document
            .getElementById("username")
            ?.value.trim();

        const password = document
            .getElementById("password")
            ?.value;

        const message = document.getElementById("loginMessage");

        if (!username || !password) {
            showMessage(
                message,
                "Please enter your username and password."
            );
            return;
        }

        localStorage.setItem("printzyStudent", "true");
        localStorage.setItem("printzyStudentName", username);

        showMessage(
            message,
            "Opening the order page...",
            "#16a34a"
        );

        window.location.href = "order.html";
    });
}

const guestBtn = document.getElementById("guestBtn");

if (guestBtn) {
    guestBtn.addEventListener("click", function () {
        localStorage.setItem("printzyStudent", "true");
        localStorage.setItem("printzyStudentName", "Guest");

        window.location.href = "order.html";
    });
}

/* =========================================
   ORDER PAGE
========================================= */

const orderForm = document.getElementById("orderForm");

if (orderForm) {
    const copiesInput = document.getElementById("copies");
    const printTypeInput = document.getElementById("printType");

    const printingAmount = document.getElementById("printingAmount");
    const bindingAmount = document.getElementById("bindingAmount");
    const estimatedTotal = document.getElementById("estimatedTotal");

    const upiDisplay = document.getElementById("upiDisplay");
    const gpayBtn = document.getElementById("gpayBtn");
    const copyUpiBtn = document.getElementById("copyUpiBtn");
    const orderMessage = document.getElementById("orderMessage");

    if (upiDisplay) {
        upiDisplay.textContent = UPI_ID;
    }

    function getSelectedBinding() {
        const selected = document.querySelector(
            'input[name="binding"]:checked'
        );

        const name = selected ? selected.value : "None";

        return {
            name: name,
            price: BINDING_PRICES[name] ?? 0
        };
    }

    function updateUPILink(total) {
        if (!gpayBtn) return;

        const upiURL =
            "upi://pay?" +
            "pa=" + encodeURIComponent(UPI_ID) +
            "&pn=" + encodeURIComponent("Printzy") +
            "&am=" + encodeURIComponent(total.toFixed(2)) +
            "&cu=INR" +
            "&tn=" + encodeURIComponent("Printzy Order");

        gpayBtn.href = upiURL;
    }

    function calculateTotal() {
        const copies = Math.max(
            1,
            parseInt(copiesInput?.value || "1", 10) || 1
        );

        const printType = printTypeInput?.value || "BW";

        const pricePerCopy = PRINT_PRICES[printType] ?? PRINT_PRICES.BW;

        const printingPrice = copies * pricePerCopy;
        const binding = getSelectedBinding();

        const total =
            printingPrice +
            binding.price +
            DELIVERY_CHARGE;

        if (printingAmount) {
            printingAmount.textContent = formatMoney(printingPrice);
        }

        if (bindingAmount) {
            bindingAmount.textContent = formatMoney(binding.price);
        }

        if (estimatedTotal) {
            estimatedTotal.textContent = formatMoney(total);
        }

        updateUPILink(total);

        return total;
    }

    copiesInput?.addEventListener("input", calculateTotal);
    printTypeInput?.addEventListener("change", calculateTotal);

    document
        .querySelectorAll('input[name="binding"]')
        .forEach(function (radio) {
            radio.addEventListener("change", calculateTotal);
        });

    if (copyUpiBtn) {
        copyUpiBtn.addEventListener("click", async function () {
            try {
                await navigator.clipboard.writeText(UPI_ID);
                copyUpiBtn.textContent = "Copied!";

                setTimeout(function () {
                    copyUpiBtn.textContent = "Copy UPI ID";
                }, 1500);
            } catch (error) {
                window.prompt("Copy this UPI ID:", UPI_ID);
            }
        });
    }

    // Calculate the first total when the page opens.
    calculateTotal();

    /* =====================================
       SUBMIT ORDER
    ===================================== */

    orderForm.addEventListener("submit", function (event) {
        event.preventDefault();

        function getValue(id) {
            return document.getElementById(id)?.value.trim() || "";
        }

        const studentName = getValue("studentName");
        const phone = getValue("phone");
        const department = getValue("department");
        const studentClass = getValue("studentClass");

        const deliveryLocation = getValue("deliveryLocation");
        const deliveryTime = getValue("deliveryTime");

        const pdfInput = document.getElementById("pdfFile");
        const pdfFile = pdfInput?.files?.[0];

        const copies = parseInt(copiesInput?.value || "1", 10);
        const printType = printTypeInput?.value || "BW";
        const side = getValue("side") || "Single Side";

        const binding = getSelectedBinding();

        const paymentMethod =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            )?.value || "UPI";

        /* VALIDATION */

        if (!studentName) {
            showMessage(orderMessage, "Enter your name.");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            showMessage(
                orderMessage,
                "Enter a valid 10-digit phone number."
            );
            return;
        }

        if (!department) {
            showMessage(orderMessage, "Select your department.");
            return;
        }

        if (!studentClass) {
            showMessage(orderMessage, "Enter your class or year.");
            return;
        }

        if (!Number.isInteger(copies) || copies < 1 || copies > 500) {
            showMessage(
                orderMessage,
                "Copies must be between 1 and 500."
            );
            return;
        }

        if (!pdfFile) {
            showMessage(orderMessage, "Please select a PDF file.");
            return;
        }

        if (
            (pdfFile.type && pdfFile.type !== "application/pdf") ||
            !pdfFile.name.toLowerCase().endsWith(".pdf")
        ) {
            showMessage(orderMessage, "Only PDF files are allowed.");
            return;
        }

        if (pdfFile.size > 10 * 1024 * 1024) {
            showMessage(
                orderMessage,
                "The PDF file must be 10 MB or smaller."
            );
            return;
        }

        if (!deliveryLocation) {
            showMessage(orderMessage, "Enter your delivery location.");
            return;
        }

        if (!deliveryTime) {
            showMessage(orderMessage, "Enter your delivery time.");
            return;
        }

        /* CREATE ORDER */

        const total = calculateTotal();

        const order = {
            id: generateOrderID(),
            studentName: studentName,
            phone: phone,
            department: department,
            studentClass: studentClass,

            // Only the filename is saved; the PDF itself is not uploaded.
            fileName: pdfFile.name,

            copies: copies,
            printType: printType === "COLOUR" ? "Colour" : "B&W",
            side: side,
            binding: binding.name,
            bindingPrice: binding.price,

            deliveryLocation: deliveryLocation,
            deliveryTime: deliveryTime,

            paymentMethod: paymentMethod,
            paymentStatus:
                paymentMethod === "UPI"
                    ? "Payment Pending"
                    : "Pay Later",

            total: total,
            status: "Pending",
            createdAt: new Date().toISOString()
        };

        const orders = getOrders();
        orders.push(order);

        if (!saveOrders(orders)) {
            showMessage(
                orderMessage,
                "Could not save the order. Check your browser storage."
            );
            return;
        }

        showMessage(
            orderMessage,
            "Order placed successfully! Order ID: " + order.id,
            "#16a34a"
        );

        window.alert(
            "PRINTZY ORDER PLACED!\n\n" +
            "Order ID: " + order.id + "\n" +
            "Student: " + studentName + "\n" +
            "Total: " + formatMoney(total) + "\n" +
            "Payment: " + order.paymentStatus
        );

        orderForm.reset();

        const noBinding = document.querySelector(
            'input[name="binding"][value="None"]'
        );

        if (noBinding) {
            noBinding.checked = true;
        }

        calculateTotal();
    });
}

/* =========================================
   ADMIN / STAFF LOGIN
   No demo passwords are included.
   Configure secure authentication before use.
========================================= */

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        showMessage(
            document.getElementById("adminLoginMessage"),
            "Admin login is not configured yet. Set up secure authentication first."
        );
    });
}

const staffLoginForm = document.getElementById("staffLoginForm");

if (staffLoginForm) {
    staffLoginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        showMessage(
            document.getElementById("staffLoginMessage"),
            "Staff login is not configured yet. Set up secure authentication first."
        );
    });
}

/* Admin and staff dashboards remain unavailable until
   proper authentication and authorization are implemented. */
