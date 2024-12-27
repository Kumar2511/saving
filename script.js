const months = [
  { name: "January", days: 31 },
  { name: "February", days: 28 },
  { name: "March", days: 31 },
  { name: "April", days: 30 },
  { name: "May", days: 31 },
  { name: "June", days: 30 },
  { name: "July", days: 31 },
  { name: "August", days: 31 },
  { name: "September", days: 30 },
  { name: "October", days: 31 },
  { name: "November", days: 30 },
  { name: "December", days: 31 }
];

let setLimit = 0;
let expenses = {};
const adminCode = "kavipriya" ; // Admin code for accessing the dashboard

// Check sessionStorage for saved data
if (sessionStorage.getItem("setLimit")) {
  setLimit = parseFloat(sessionStorage.getItem("setLimit"));
  expenses = JSON.parse(sessionStorage.getItem("expenses"));
  document.getElementById("set-limit-section").classList.add("hidden");
  document.getElementById("calendar-section").classList.remove("hidden");
  generateCalendar();
}

document.getElementById("set-limit-button").addEventListener("click", () => {
  const limitInput = document.getElementById("limit-input").value;
  setLimit = parseFloat(limitInput);

  if (isNaN(setLimit) || setLimit <= 0) {
    alert("Please enter a valid limit.");
    return;
  }

  // Save data in sessionStorage
  sessionStorage.setItem("setLimit", setLimit);
  sessionStorage.setItem("expenses", JSON.stringify(expenses));

  document.getElementById("set-limit-section").classList.add("hidden");
  document.getElementById("calendar-section").classList.remove("hidden");

  generateCalendar();
});

function generateCalendar() {
  const calendarContainer = document.getElementById("calendar-container");
  calendarContainer.innerHTML = "";

  months.forEach((month, monthIndex) => {
    const monthDiv = document.createElement("div");
    monthDiv.classList.add("month");

    const totalExpenses = calculateTotalExpenses(monthIndex);
    const remainingBalance = setLimit - totalExpenses;

    monthDiv.innerHTML = `
      <h3>${month.name}</h3>
      <div class="days">${generateDays(monthIndex)}</div>
      <div class="total">
        <p>Amount Spent: ₹${totalExpenses}</p>
        <p>Remaining Balance: ₹${remainingBalance}</p>
      </div>
    `;
    calendarContainer.appendChild(monthDiv);
  });
}

function generateDays(monthIndex) {
  const daysInMonth = months[monthIndex].days;
  const firstDayOfMonth = new Date(2025, monthIndex, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push("<button class='hidden'></button>");
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(`<button data-month="${monthIndex}" data-day="${i}" onclick="showExpensePopup(${monthIndex}, ${i})">${i}</button>`);
  }
  return days.join("");
}

function showExpensePopup(monthIndex, day) {
  const popup = document.getElementById("expense-popup");
  popup.classList.add("show");

  document.getElementById("submit-expense").onclick = () => {
    const reason = document.getElementById("expense-reason").value;
    const amount = parseFloat(document.getElementById("expense-amount").value);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }

    if (!expenses[monthIndex]) expenses[monthIndex] = {};
    expenses[monthIndex][day] = { reason, amount };

    // Save updated expenses in sessionStorage
    sessionStorage.setItem("expenses", JSON.stringify(expenses));

    popup.classList.remove("show");
    alert(`Expense of ₹${amount} added on ${months[monthIndex].name} ${day}`);
    generateCalendar(); // Update the calendar after adding the expense
  };

  document.getElementById("close-popup").onclick = () => {
    popup.classList.remove("show");
  };
}

function calculateTotalExpenses(monthIndex) {
  return Object.values(expenses[monthIndex] || {}).reduce((sum, expense) => sum + expense.amount, 0);
}

document.getElementById("admin-access-button").addEventListener("click", () => {
  const enteredCode = document.getElementById("admin-code").value;
  if (enteredCode === adminCode) {
    document.getElementById("calendar-section").classList.add("hidden");
    document.getElementById("admin-dashboard").classList.remove("hidden");
    generateAdminDashboard();
  } else {
    alert("Invalid Admin Code");
  }
});

function generateAdminDashboard() {
  const adminTableContainer = document.getElementById("admin-table-container");
  adminTableContainer.innerHTML = "";

  months.forEach((month, monthIndex) => {
    const table = document.createElement("table");
    let tableContent = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Reason</th>
          <th>Amount</th>
          <th>Limit</th>
          <th>Remaining Balance</th>
        </tr>
      </thead>
      <tbody>
    `;
    for (let day = 1; day <= month.days; day++) {
      const expense = expenses[monthIndex] && expenses[monthIndex][day];
      const amount = expense ? expense.amount : 0;
      tableContent += `
        <tr>
          <td>${day}</td>
          <td>${expense ? expense.reason : ""}</td>
          <td>${amount ? "₹" + amount : ""}</td>
          <td>₹${setLimit}</td>
          <td>₹${setLimit - amount}</td>
        </tr>
      `;
    }
    tableContent += "</tbody>";
    table.innerHTML = tableContent;
    adminTableContainer.appendChild(table);
  });
}