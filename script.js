/* =========================================================
   PRINTZY SCRIPT
========================================================= */


/* ================= SETTINGS ================= */

const UPI_ID = "YOUR-UPI-ID@upi";

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


/* ================= ADMIN ================= */

const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "printzyadmin";


/* ================= STAFF ================= */

const staffAccounts = [

    {
        id: "PZ-ST001",
        password: "staff001",
        name: "Staff 1",
        role: "Printing Staff"
    },

    {
        id: "PZ-ST002",
        password: "staff002",
        name: "Staff 2",
        role: "Printing Staff"
    },

    {
        id: "PZ-ST003",
        password: "staff003",
        name: "Staff 3",
        role: "Printing Staff"
    }

];


/* =========================================================
   COMMON FUNCTIONS
========================================================= */


function getOrders() {

    try {

        return JSON.parse(
            localStorage.getItem("printzyOrders")
        ) || [];

    } catch {

        return [];

    }

}


function saveOrders(orders) {

    localStorage.setItem(
        "printzyOrders",
        JSON.stringify(orders)
    );

}


function generateOrderID() {

    return "PZ-" +
        Date.now().toString().slice(-8);

}


function formatMoney(value) {

    return "₹" + Number(value || 0).toLocaleString("en-IN");

}


function getTodayString() {

    const date = new Date();

    return date.toISOString().split("T")[0];

}


function getMonthString() {

    const date = new Date();

    return date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0");

}


function getYearString() {

    return String(
        new Date().getFullYear()
    );

}


/* =========================================================
   STUDENT LOGIN
========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const username =
                document.getElementById("username")
                    .value.trim();

            const password =
                document.getElementById("password")
                    .value.trim();

            const message =
                document.getElementById("loginMessage");


            if (!username || !password) {

                message.textContent =
                    "Please enter username and password.";

                message.style.color = "#ef4444";

                return;

            }


            localStorage.setItem(
                "printzyStudent",
                "true"
            );

            localStorage.setItem(
                "printzyStudentName",
                username
            );


            message.textContent =
                "Login successful! Redirecting...";

            message.style.color =
                "#24b47e";


            setTimeout(function() {

                window.location.href =
                    "order.html";

            }, 600);

        }
    );

}


/* ================= GUEST ================= */

const guestBtn =
    document.getElementById("guestBtn");


if (guestBtn) {

    guestBtn.addEventListener(
        "click",
        function() {

            localStorage.setItem(
                "printzyStudent",
                "true"
            );

            localStorage.setItem(
                "printzyStudentName",
                "Guest"
            );

            window.location.href =
                "order.html";

        }
    );

}


/* =========================================================
   ORDER PAGE
========================================================= */

const orderForm =
    document.getElementById("orderForm");


if (orderForm) {

    const copies =
        document.getElementById("copies");

    const printType =
        document.getElementById("printType");

    const printingAmount =
        document.getElementById("printingAmount");

    const bindingAmount =
        document.getElementById("bindingAmount");

    const estimatedTotal =
        document.getElementById("estimatedTotal");

    const upiDisplay =
        document.getElementById("upiDisplay");

    const gpayBtn =
        document.getElementById("gpayBtn");


    /* ================= UPI ================= */

    if (upiDisplay) {

        upiDisplay.textContent =
            UPI_ID;

    }


    function updateUPILink() {

        const total =
            calculateTotal();

        const upiURL =
            "upi://pay?" +
            "pa=" +
            encodeURIComponent(UPI_ID) +
            "&pn=" +
            encodeURIComponent("Printzy") +
            "&am=" +
            encodeURIComponent(total.toFixed(2)) +
            "&cu=INR" +
            "&tn=" +
            encodeURIComponent("Printzy Order");

        if (gpayBtn) {

            gpayBtn.href =
                upiURL;

        }

    }


    /* ================= CALCULATE ================= */

    function getSelectedBinding() {

        const selected =
            document.querySelector(
                'input[name="binding"]:checked'
            );

        if (!selected) {

            return {
                name: "None",
                price: 0
            };

        }


        return {

            name: selected.value,

            price:
                Number(
                    selected.dataset.price
                )

        };

    }


    function calculateTotal() {

        const copyCount =
            Math.max(
                1,
                Number(copies.value) || 1
            );


        const pricePerCopy =
            PRINT_PRICES[
                printType.value
            ] || 1;


        const printing =
            copyCount * pricePerCopy;


        const binding =
            getSelectedBinding();


        const total =
            printing +
            binding.price +
            DELIVERY_CHARGE;


        printingAmount.textContent =
            formatMoney(printing);

        bindingAmount.textContent =
            formatMoney(binding.price);

        estimatedTotal.textContent =
            formatMoney(total);


        updateUPILink();


        return total;

    }


    copies.addEventListener(
        "input",
        calculateTotal
    );


    printType.addEventListener(
        "change",
        calculateTotal
    );


    document
        .querySelectorAll(
            'input[name="binding"]'
        )
        .forEach(function(radio) {

            radio.addEventListener(
                "change",
                calculateTotal
            );

        });


    calculateTotal();


    /* ================= COPY UPI ================= */

    const copyUpiBtn =
        document.getElementById(
            "copyUpiBtn"
        );


    if (copyUpiBtn) {

        copyUpiBtn.addEventListener(
            "click",
            async function() {

                try {

                    await navigator.clipboard.writeText(
                        UPI_ID
                    );

                    copyUpiBtn.textContent =
                        "Copied ✓";

                    setTimeout(function() {

                        copyUpiBtn.textContent =
                            "Copy UPI ID";

                    }, 1500);

                } catch {

                    alert(
                        "Copy failed. UPI ID: " +
                        UPI_ID
                    );

                }

            }
        );

    }


    /* ================= SUBMIT ORDER ================= */

    orderForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const studentName =
                document.getElementById(
                    "studentName"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            const department =
                document.getElementById(
                    "department"
                ).value;


            const studentClass =
                document.getElementById(
                    "studentClass"
                ).value.trim();


            const pdfFile =
                document.getElementById(
                    "pdfFile"
                ).files[0];


            const copyCount =
                Math.max(
                    1,
                    Number(copies.value) || 1
                );


            const selectedBinding =
                getSelectedBinding();


            const deliveryLocation =
                document.getElementById(
                    "deliveryLocation"
                ).value.trim();


            const deliveryTime =
                document.getElementById(
                    "deliveryTime"
                ).value.trim();


            const paymentMethod =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                ).value;


            const message =
                document.getElementById(
                    "orderMessage"
                );


            /* ================= VALIDATION ================= */

            if (!pdfFile) {

                message.textContent =
                    "Please select a PDF file.";

                message.style.color =
                    "#ef4444";

                return;

            }


            if (
                pdfFile.type !==
                    "application/pdf" &&
                !pdfFile.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {

                message.textContent =
                    "Only PDF files are allowed.";

                message.style.color =
                    "#ef4444";

                return;

            }


            if (
                pdfFile.size >
                10 * 1024 * 1024
            ) {

                message.textContent =
                    "PDF must be smaller than 10 MB.";

                message.style.color =
                    "#ef4444";

                return;

            }


            if (
                !/^[0-9]{10}$/.test(phone)
            ) {

                message.textContent =
                    "Enter a valid 10-digit phone number.";

                message.style.color =
                    "#ef4444";

                return;

            }


            const total =
                calculateTotal();


            /* ================= ORDER ================= */

            const order = {

                id:
                    generateOrderID(),

                studentName:
                    studentName,

                phone:
                    phone,

                department:
                    department,

                studentClass:
                    studentClass,

                fileName:
                    pdfFile.name,

                copies:
                    copyCount,

                printType:
                    printType.value ===
                    "COLOUR"
                        ? "Colour"
                        : "B&W",

                side:
                    document.getElementById(
                        "side"
                    ).value,

                binding:
                    selectedBinding.name,

                bindingPrice:
                    selectedBinding.price,

                deliveryLocation:
                    deliveryLocation,

                deliveryTime:
                    deliveryTime,

                paymentMethod:
                    paymentMethod,

                paymentStatus:
                    paymentMethod === "UPI"
                        ? "Payment Pending"
                        : "Pay Later",

                total:
                    total,

                status:
                    "Pending",

                assignedStaffId:
                    "",

                assignedStaffName:
                    "",

                createdAt:
                    new Date().toISOString()

            };


            const orders =
                getOrders();


            orders.push(order);


            saveOrders(orders);


            message.textContent =
                "Order placed successfully! Order ID: " +
                order.id;

            message.style.color =
                "#24b47e";


            orderForm.reset();


            document.querySelector(
                'input[name="binding"][value="None"]'
            ).checked = true;


            document.getElementById(
                "printingAmount"
            ).textContent = "₹0";


            document.getElementById(
                "bindingAmount"
            ).textContent = "₹0";


            document.getElementById(
                "estimatedTotal"
            ).textContent = "₹20";


            alert(
                "Order placed successfully!\n\n" +
                "Order ID: " +
                order.id +
                "\n\n" +
                "Total: " +
                formatMoney(order.total)
            );

        }
    );

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "adminUsername"
                ).value.trim();


            const password =
                document.getElementById(
                    "adminPassword"
                ).value.trim();


            const message =
                document.getElementById(
                    "adminLoginMessage"
                );


            if (
                id === ADMIN_ID &&
                password === ADMIN_PASSWORD
            ) {

                localStorage.setItem(
                    "printzyAdmin",
                    "true"
                );


                message.textContent =
                    "Login successful!";

                message.style.color =
                    "#24b47e";


                setTimeout(function() {

                    window.location.href =
                        "admin-dashboard.html";

                }, 500);

            } else {

                message.textContent =
                    "Incorrect Admin ID or password.";

                message.style.color =
                    "#ef4444";

            }

        }
    );

}


/* =========================================================
   STAFF LOGIN
========================================================= */

const staffLoginForm =
    document.getElementById(
        "staffLoginForm"
    );


if (staffLoginForm) {

    staffLoginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "staffUsername"
                ).value.trim();


            const password =
                document.getElementById(
                    "staffPassword"
                ).value.trim();


            const message =
                document.getElementById(
                    "staffLoginMessage"
                );


            const staff =
                staffAccounts.find(
                    function(account) {

                        return (
                            account.id === id &&
                            account.password === password
                        );

                    }
                );


            if (!staff) {

                message.textContent =
                    "Incorrect Staff ID or password.";

                message.style.color =
                    "#ef4444";

                return;

            }


            localStorage.setItem(
                "printzyStaff",
                "true"
            );

            localStorage.setItem(
                "printzyStaffID",
                staff.id
            );

            localStorage.setItem(
                "printzyStaffName",
                staff.name
            );

            localStorage.setItem(
                "printzyStaffRole",
                staff.role
            );


            message.textContent =
                "Login successful!";

            message.style.color =
                "#24b47e";


            setTimeout(function() {

                window.location.href =
                    "staff-dashboard.html";

            }, 500);

        }
    );

}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

if (
    window.location.pathname.endsWith(
        "admin-dashboard.html"
    )
) {

    const loggedIn =
        localStorage.getItem(
            "printzyAdmin"
        );


    if (loggedIn !== "true") {

        window.location.href =
            "admin-login.html";

    }


    displayAdminDashboard();


    const logout =
        document.getElementById(
            "adminLogoutBtn"
        );


    if (logout) {

        logout.addEventListener(
            "click",
            function() {

                localStorage.removeItem(
                    "printzyAdmin"
                );

                window.location.href =
                    "admin-login.html";

            }
        );

    }


    const search =
        document.getElementById(
            "orderSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            displayAdminOrders
        );

    }


    const clearBtn =
        document.getElementById(
            "clearOrdersBtn"
        );


    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            function() {

                const confirmed =
                    confirm(
                        "Delete all orders from this browser?"
                    );


                if (!confirmed) return;


                localStorage.removeItem(
                    "printzyOrders"
                );


                displayAdminDashboard();

            }
        );

    }

}


/* ================= ADMIN DASHBOARD ================= */

function displayAdminDashboard() {

    const orders =
        getOrders();


    const today =
        getTodayString();


    const month =
        getMonthString();


    const year =
        getYearString();


    const todayOrders =
        orders.filter(function(order) {

            return order.createdAt &&
                order.createdAt.startsWith(
                    today
                );

        });


    const monthOrders =
        orders.filter(function(order) {

            return order.createdAt &&
                order.createdAt.startsWith(
                    month
                );

        });


    const yearOrders =
        orders.filter(function(order) {

            return order.createdAt &&
                order.createdAt.startsWith(
                    year
                );

        });


    const todayRevenue =
        sumOrders(todayOrders);


    const monthRevenue =
        sumOrders(monthOrders);


    const yearRevenue =
        sumOrders(yearOrders);


    const average =
        orders.length
            ? orders.reduce(
                function(total, order) {
                    return total +
                        Number(order.total || 0);
                },
                0
            ) / orders.length
            : 0;


    setText(
        "totalOrders",
        orders.length
    );


    setText(
        "pendingOrders",
        orders.filter(
            order =>
                order.status ===
                "Pending"
        ).length
    );


    setText(
        "todayRevenue",
        formatMoney(todayRevenue)
    );


    setText(
        "monthRevenue",
        formatMoney(monthRevenue)
    );


    setText(
        "yearRevenue",
        formatMoney(yearRevenue)
    );


    setText(
        "averageOrder",
        formatMoney(average)
    );


    setText(
        "businessToday",
        formatMoney(todayRevenue)
    );


    setText(
        "businessMonth",
        formatMoney(monthRevenue)
    );


    setText(
        "businessYear",
        formatMoney(yearRevenue)
    );


    displayStaffList();

    displayAdminOrders();

}


/* ================= SUM ================= */

function sumOrders(orders) {

    return orders.reduce(
        function(total, order) {

            return total +
                Number(order.total || 0);

        },
        0
    );

}


/* ================= TEXT ================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* ================= STAFF LIST ================= */

function displayStaffList() {

    const container =
        document.getElementById(
            "staffList"
        );


    if (!container) return;


    const orders =
        getOrders();


    container.innerHTML =
        staffAccounts.map(
            function(staff) {

                const assigned =
                    orders.filter(
                        order =>
                            order.assignedStaffId ===
                            staff.id
                    ).length;


                return `

                    <div class="staff-card">

                        <h3>
                            🧑‍💻 ${staff.name}
                        </h3>

                        <p>
                            Staff ID:
                            <b>${staff.id}</b>
                        </p>

                        <p>
                            Role:
                            ${staff.role}
                        </p>

                        <p>
                            Assigned Orders:
                            <b>${assigned}</b>
                        </p>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   ADMIN ORDER DISPLAY
========================================================= */

function displayAdminOrders() {

    const container =
        document.getElementById(
            "adminOrdersContainer"
        );


    if (!container) return;


    let orders =
        getOrders();


    const searchElement =
        document.getElementById(
            "orderSearch"
        );


    const search =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";


    if (search) {

        orders =
            orders.filter(
                function(order) {

                    return (

                        order.id
                            .toLowerCase()
                            .includes(search)

                        ||

                        order.studentName
                            .toLowerCase()
                            .includes(search)

                        ||

                        order.department
                            .toLowerCase()
                            .includes(search)

                        ||

                        order.fileName
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    if (!orders.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>📭</div>

                <h3>No orders found</h3>

                <p>
                    New student orders will appear here.
                </p>

            </div>

        `;

        return;

    }


    orders.sort(
        function(a, b) {

            return new Date(b.createdAt) -
                new Date(a.createdAt);

        }
    );


    container.innerHTML =
        orders.map(
            createAdminOrderHTML
        ).join("");


    attachAdminOrderEvents();

}


/* ================= ADMIN ORDER HTML ================= */

function createAdminOrderHTML(order) {

    const staffOptions =
        staffAccounts.map(
            function(staff) {

                return `

                    <option
                        value="${staff.id}"
                        ${
                            order.assignedStaffId ===
                            staff.id
                                ? "selected"
                                : ""
                        }
                    >
                        ${staff.name}
                    </option>

                `;

            }
        ).join("");


    return `

        <article class="order-card">

            <div class="order-card-header">

                <div>

                    <div class="order-id">
                        ${order.id}
                    </div>

                    <strong>
                        ${escapeHTML(order.studentName)}
                    </strong>

                </div>

                <span class="status status-${order.status.toLowerCase()}">
                    ${order.status}
                </span>

            </div>


            <div class="order-details">

                <div>
                    🎓 <b>Department:</b>
                    ${escapeHTML(order.department)}
                </div>

                <div>
                    📚 <b>Class:</b>
                    ${escapeHTML(order.studentClass)}
                </div>

                <div>
                    📞 <b>Phone:</b>
                    ${escapeHTML(order.phone)}
                </div>

                <div>
                    📄 <b>File:</b>
                    ${escapeHTML(order.fileName)}
                </div>

                <div>
                    🔢 <b>Copies:</b>
                    ${order.copies}
                </div>

                <div>
                    🖨️ <b>Print:</b>
                    ${order.printType}
                </div>

                <div>
                    📑 <b>Side:</b>
                    ${order.side}
                </div>

                <div>
                    🌀 <b>Binding:</b>
                    ${order.binding}
                </div>

                <div>
                    💳 <b>Payment:</b>
                    ${order.paymentMethod}
                </div>

                <div>
                    💰 <b>Total:</b>
                    ${formatMoney(order.total)}
                </div>

                <div>
                    📍 <b>Location:</b>
                    ${escapeHTML(order.deliveryLocation)}
                </div>

                <div>
                    ⏰ <b>Time:</b>
                    ${escapeHTML(order.deliveryTime)}
                </div>

            </div>


            <div class="order-actions">

                <select
                    class="assign-select"
                    data-order-id="${order.id}"
                >

                    <option value="">
                        Assign Staff
                    </option>

                    ${staffOptions}

                </select>


                <select
                    class="status-select"
                    data-order-id="${order.id}"
                >

                    ${statusOptions(
                        order.status
                    )}

                </select>

            </div>

        </article>

    `;

}


/* ================= STATUS OPTIONS ================= */

function statusOptions(current) {

    const statuses = [
        "Pending",
        "Printing",
        "Ready",
        "Delivered",
        "Cancelled"
    ];


    return statuses.map(
        function(status) {

            return `

                <option
                    value="${status}"
                    ${
                        current === status
                            ? "selected"
                            : ""
                    }
                >
                    ${status}
                </option>

            `;

        }
    ).join("");

}


/* ================= ADMIN EVENTS ================= */

function attachAdminOrderEvents() {

    document
        .querySelectorAll(".assign-select")
        .forEach(
            function(select) {

                select.addEventListener(
                    "change",
                    function() {

                        assignStaff(
                            select.dataset.orderId,
                            select.value
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(".status-select")
        .forEach(
            function(select) {

                select.addEventListener(
                    "change",
                    function() {

                        updateOrderStatus(
                            select.dataset.orderId,
                            select.value
                        );

                    }
                );

            }
        );

}


/* ================= ASSIGN STAFF ================= */

function assignStaff(
    orderID,
    staffID
) {

    const orders =
        getOrders();


    const order =
        orders.find(
            item =>
                item.id === orderID
        );


    if (!order) return;


    if (!staffID) {

        order.assignedStaffId =
            "";

        order.assignedStaffName =
            "";

    } else {

        const staff =
            staffAccounts.find(
                item =>
                    item.id === staffID
            );


        if (staff) {

            order.assignedStaffId =
                staff.id;

            order.assignedStaffName =
                staff.name;

        }

    }


    saveOrders(orders);

    displayAdminDashboard();

}


/* ================= UPDATE STATUS ================= */

function updateOrderStatus(
    orderID,
    newStatus
) {

    const orders =
        getOrders();


    const order =
        orders.find(
            item =>
                item.id === orderID
        );


    if (!order) return;


    order.status =
        newStatus;


    saveOrders(orders);

    displayAdminDashboard();

}


/* =========================================================
   STAFF DASHBOARD
========================================================= */

if (
    window.location.pathname.endsWith(
        "staff-dashboard.html"
    )
) {

    const loggedIn =
        localStorage.getItem(
            "printzyStaff"
        );


    if (loggedIn !== "true") {

        window.location.href =
            "staff-login.html";

    }


    displayStaffDashboard();


    const logout =
        document.getElementById(
            "staffLogoutBtn"
        );


    if (logout) {

        logout.addEventListener(
            "click",
            function() {

                localStorage.removeItem(
                    "printzyStaff"
                );

                localStorage.removeItem(
                    "printzyStaffID"
                );

                localStorage.removeItem(
                    "printzyStaffName"
                );

                localStorage.removeItem(
                    "printzyStaffRole"
                );


                window.location.href =
                    "staff-login.html";

            }
        );

    }


    const search =
        document.getElementById(
            "staffOrderSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            displayStaffDashboard
        );

    }

}


/* ================= STAFF DASHBOARD ================= */

function displayStaffDashboard() {

    const staffID =
        localStorage.getItem(
            "printzyStaffID"
        );


    const staffName =
        localStorage.getItem(
            "printzyStaffName"
        );


    setText(
        "loggedStaffName",
        "🧑‍💻 " + (staffName || "Staff")
    );


    const allOrders =
        getOrders();


    let myOrders =
        allOrders.filter(
            function(order) {

                return (
                    order.assignedStaffId ===
                    staffID
                );

            }
        );


    const searchElement =
        document.getElementById(
            "staffOrderSearch"
        );


    const search =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";


    if (search) {

        myOrders =
            myOrders.filter(
                function(order) {

                    return (

                        order.id
                            .toLowerCase()
                            .includes(search)

                        ||

                        order.studentName
                            .toLowerCase()
                            .includes(search)

                        ||

                        order.department
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    setText(
        "myOrders",
        myOrders.length
    );


    setText(
        "myPending",
        myOrders.filter(
            order =>
                order.status ===
                "Pending"
        ).length
    );


    setText(
        "myPrinting",
        myOrders.filter(
            order =>
                order.status ===
                "Printing"
        ).length
    );


    const container =
        document.getElementById(
            "staffOrdersContainer"
        );


    if (!container) return;


    if (!myOrders.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>📭</div>

                <h3>No assigned orders</h3>

                <p>
                    Admin must assign an order to you.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        myOrders.map(
            createStaffOrderHTML
        ).join("");


    attachStaffEvents();

}


/* ================= STAFF ORDER HTML ================= */

function createStaffOrderHTML(order) {

    return `

        <article class="order-card">

            <div class="order-card-header">

                <div>

                    <div class="order-id">
                        ${order.id}
                    </div>

                    <strong>
                        ${escapeHTML(order.studentName)}
                    </strong>

                </div>

                <span class="status status-${order.status.toLowerCase()}">
                    ${order.status}
                </span>

            </div>


            <div class="order-details">

                <div>
                    🎓 <b>Department:</b>
                    ${escapeHTML(order.department)}
                </div>

                <div>
                    📚 <b>Class:</b>
                    ${escapeHTML(order.studentClass)}
                </div>

                <div>
                    📄 <b>File:</b>
                    ${escapeHTML(order.fileName)}
                </div>

                <div>
                    🔢 <b>Copies:</b>
                    ${order.copies}
                </div>

                <div>
                    🖨️ <b>Print:</b>
                    ${order.printType}
                </div>

                <div>
                    📑 <b>Side:</b>
                    ${order.side}
                </div>

                <div>
                    🌀 <b>Binding:</b>
                    ${order.binding}
                </div>

                <div>
                    📍 <b>Location:</b>
                    ${escapeHTML(order.deliveryLocation)}
                </div>

                <div>
                    ⏰ <b>Delivery:</b>
                    ${escapeHTML(order.deliveryTime)}
                </div>

                <div>
                    💰 <b>Total:</b>
                    ${formatMoney(order.total)}
                </div>

            </div>


            <div class="order-actions">

                <select
                    class="status-select staff-status"
                    data-order-id="${order.id}"
                >

                    ${statusOptions(
                        order.status
                    )}

                </select>

            </div>

        </article>

    `;

}


/* ================= STAFF EVENTS ================= */

function attachStaffEvents() {

    document
        .querySelectorAll(".staff-status")
        .forEach(
            function(select) {

                select.addEventListener(
                    "change",
                    function() {

                        updateStaffOrderStatus(
                            select.dataset.orderId,
                            select.value
                        );

                    }
                );

            }
        );

}


/* ================= STAFF STATUS ================= */

function updateStaffOrderStatus(
    orderID,
    status
) {

    const orders =
        getOrders();


    const staffID =
        localStorage.getItem(
            "printzyStaffID"
        );


    const order =
        orders.find(
            function(item) {

                return (
                    item.id === orderID &&
                    item.assignedStaffId === staffID
                );

            }
        );


    if (!order) return;


    order.status =
        status;


    saveOrders(orders);

    displayStaffDashboard();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}