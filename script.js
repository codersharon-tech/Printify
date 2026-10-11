"use strict";

/* ======================================
   PRINTZY SETTINGS
====================================== */

const UPI_ID = "8695185199@pytes";
const DELIVERY_CHARGE = 20;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

const PRINT_PRICES = {
    BW: 1,
    COLOUR: 5
};

const BINDING_PRICES = {
    None: 0,
    Stapling: 5,
    "Comb Binding": 25,
    "Spiral Binding": 30,
    Softcover: 40,
    Hardcover: 80
};

/* ======================================
   COMMON FUNCTIONS
====================================== */

function money(amount) {
    return "₹" + Number(amount).toFixed(2);
}

function showMessage(message, color = "#dc2626") {
    const element = document.getElementById("orderMessage");

    if (element) {
        element.textContent = message;
        element.style.color = color;
    }
}

function getOrders() {
    try {
        const orders = JSON.parse(
            localStorage.getItem("printzyOrders") || "[]"
        );

        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        console.error(error);
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
        console.error(error);
        return false;
    }
}

/* ======================================
   PDF PAGE COUNT AND ORDER CALCULATION
====================================== */

const orderForm = document.getElementById("orderForm");

if (orderForm) {
    const pdfInput = document.getElementById("pdfFile");
    const copiesInput = document.getElementById("copies");
    const printTypeInput = document.getElementById("printType");
    const bindingInput = document.getElementById("binding");

    const pageDisplay = document.getElementById("pdfPageCount");
    const summaryPages = document.getElementById("summaryPages");
    const summaryCopies = document.getElementById("summaryCopies");
    const summaryPrintedPages =
        document.getElementById("summaryPrintedPages");

    const printingAmount = document.getElementById("printingAmount");
    const bindingAmount = document.getElementById("bindingAmount");
    const estimatedTotal = document.getElementById("estimatedTotal");

    const submitButton = document.getElementById("submitOrder");

    let pdfPageCount = 0;
    let pdfLoading = false;
    let pdfRequestNumber = 0;

    document.getElementById("upiDisplay").textContent = UPI_ID;

    function getCopies() {
        return Math.max(
            1,
            Math.min(
                500,
                parseInt(copiesInput.value, 10) || 1
            )
        );
    }

    function getBindingPrice() {
        return BINDING_PRICES[bindingInput.value] ?? 0;
    }

    function calculateTotal() {
        const copies = getCopies();
        const pricePerPage =
            PRINT_PRICES[printTypeInput.value] ?? 1;

        const printedPages = pdfPageCount * copies;
        const printCost = printedPages * pricePerPage;
        const bindingCost = getBindingPrice();

        const total =
            printCost + bindingCost + DELIVERY_CHARGE;

        summaryCopies.textContent = copies;

        summaryPages.textContent =
            pdfPageCount > 0 ? pdfPageCount : "—";

        summaryPrintedPages.textContent =
            pdfPageCount > 0 ? printedPages : "—";

        printingAmount.textContent =
            pdfPageCount > 0 ? money(printCost) : "Upload PDF";

        bindingAmount.textContent = money(bindingCost);

        estimatedTotal.textContent =
            pdfPageCount > 0 ? money(total) : "Upload PDF";

        updateUPILink(total);

        return {
            copies,
            printedPages,
            printCost,
            bindingCost,
            total,
            pricePerPage
        };
    }

    function updateUPILink(amount) {
        const button = document.getElementById("gpayBtn");

        if (!button) return;

        const params = new URLSearchParams({
            pa: UPI_ID,
            pn: "Printzy",
            am: amount.toFixed(2),
            cu: "INR",
            tn: "Printzy Printing Order"
        });

        button.href = "upi://pay?" + params.toString();
    }

    /* Read selected PDF and count its pages */
    pdfInput.addEventListener("change", async function () {
        const file = pdfInput.files[0];
        const requestNumber = ++pdfRequestNumber;

        pdfPageCount = 0;
        pdfLoading = false;

        pageDisplay.textContent = "PDF pages detected: —";
        calculateTotal();

        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            pdfInput.value = "";
            showMessage("Please select a PDF file.");
            return;
        }

        if (file.size > MAX_PDF_SIZE) {
            pdfInput.value = "";
            showMessage("PDF must be 10 MB or smaller.");
            return;
        }

        if (typeof pdfjsLib === "undefined") {
            showMessage(
                "PDF reader failed to load. Check your internet connection and refresh."
            );
            return;
        }

        pdfLoading = true;
        submitButton.disabled = true;

        pageDisplay.textContent = "Counting PDF pages...";
        showMessage("Reading PDF. Please wait...", "#2563eb");

        try {
            const bytes = new Uint8Array(await file.arrayBuffer());

            const pdf = await pdfjsLib.getDocument({
                data: bytes
            }).promise;

            if (requestNumber !== pdfRequestNumber) {
                await pdf.destroy();
                return;
            }

            pdfPageCount = pdf.numPages;

            if (pdfPageCount < 1) {
                throw new Error("PDF contains no pages.");
            }

            pageDisplay.textContent =
                "PDF pages detected: " + pdfPageCount;

            showMessage(
                "PDF successfully read: " + pdfPageCount + " pages.",
                "#16a34a"
            );

            await pdf.destroy();

        } catch (error) {
            console.error("PDF error:", error);

            if (requestNumber === pdfRequestNumber) {
                pdfPageCount = 0;

                pageDisplay.textContent =
                    "Unable to read PDF pages.";

                showMessage(
                    "Could not read this PDF. Please try another PDF."
                );
            }
        } finally {
            if (requestNumber === pdfRequestNumber) {
                pdfLoading = false;
                submitButton.disabled = false;
                calculateTotal();
            }
        }
    });

    copiesInput.addEventListener("input", calculateTotal);
    printTypeInput.addEventListener("change", calculateTotal);
    bindingInput.addEventListener("change", calculateTotal);

    /* Copy UPI ID */
    document.getElementById("copyUpiBtn")
        .addEventListener("click", async function () {
            try {
                await navigator.clipboard.writeText(UPI_ID);
                this.textContent = "Copied!";

                setTimeout(() => {
                    this.textContent = "Copy UPI ID";
                }, 1500);
            } catch (error) {
                window.prompt("Copy your UPI ID:", UPI_ID);
            }
        });

    /* ======================================
       PLACE ORDER
    ====================================== */

    orderForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (pdfLoading) {
            showMessage("Please wait while the PDF page count is calculated.");
            return;
        }

        if (pdfPageCount < 1) {
            showMessage("Upload a readable PDF and wait for page counting.");
            return;
        }

        if (!orderForm.reportValidity()) {
            return;
        }

        const studentName =
            document.getElementById("studentName").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        if (!/^[0-9]{10}$/.test(phone)) {
            showMessage("Enter a valid 10-digit phone number.");
            return;
        }

        const details = calculateTotal();

        const order = {
            id: "PZ-" + Date.now(),
            studentName,
            phone,

            department:
                document.getElementById("department").value,

            studentClass:
                document.getElementById("studentClass").value.trim(),

            fileName: pdfInput.files[0].name,

            pageCount: pdfPageCount,
            copies: details.copies,
            totalPrintedPages: details.printedPages,

            printType: printTypeInput.value,
            pricePerPage: details.pricePerPage,

            side: document.getElementById("side").value,

            binding: bindingInput.value,
            bindingPrice: details.bindingCost,

            deliveryLocation:
                document.getElementById("deliveryLocation").value.trim(),

            deliveryTime:
                document.getElementById("deliveryTime").value.trim(),

            paymentMethod:
                document.getElementById("paymentMethod").value,

            paymentStatus:
                document.getElementById("paymentMethod").value === "UPI"
                    ? "Payment Pending"
                    : "Pay Later",

            printingPrice: details.printCost,
            deliveryCharge: DELIVERY_CHARGE,
            total: details.total,

            status: "Pending",
            createdAt: new Date().toISOString()
        };

        const orders = getOrders();
        orders.push(order);

        if (!saveOrders(orders)) {
            showMessage(
                "Order could not be saved. Browser storage may be unavailable."
            );
            return;
        }

        showMessage(
            "Order placed successfully! Order ID: " + order.id,
            "#16a34a"
        );

        alert(
            "PRINTZY ORDER SUCCESSFUL!\n\n" +
            "Order ID: " + order.id + "\n" +
            "PDF pages: " + order.pageCount + "\n" +
            "Copies: " + order.copies + "\n" +
            "Total printed pages: " + order.totalPrintedPages + "\n" +
            "Printing cost: " + money(order.printingPrice) + "\n" +
            "Binding: " + money(order.bindingPrice) + "\n" +
            "Delivery: " + money(order.deliveryCharge) + "\n" +
            "TOTAL: " + money(order.total)
        );

        orderForm.reset();

        pdfRequestNumber++;
        pdfPageCount = 0;
        pdfLoading = false;

        pageDisplay.textContent = "PDF pages detected: —";
        calculateTotal();
    });

    calculateTotal();
}
