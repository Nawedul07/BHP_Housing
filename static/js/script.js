// Populate location dropdown on page load
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/static/column/columns.json");
    const data = await res.json();
    const allColumns = data.data_columns;

    const locations = allColumns.slice(3).map(loc => loc.toLowerCase());
    const datalist = document.getElementById("locationList");

    locations.forEach(loc => {
      const option = document.createElement("option");
      option.value = loc;
      datalist.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load locations:", err);
  }
});

document.getElementById("predictionForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const resultDiv = document.getElementById("result");
  resultDiv.classList.remove("fade-in");
  resultDiv.innerHTML = "⌛ Estimating price...";

  const data = {
    location: document.getElementById("location").value,
    sqft: +document.getElementById("sqft").value,
    bath: +document.getElementById("bath").value,
    bhk: +document.getElementById("bhk").value
  };

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    const rawPrice = parseFloat(result.price);

    let formatted = "Unavailable";

    if (!isNaN(rawPrice)) {
      if (rawPrice >= 100) {
        const crore = (rawPrice / 100).toFixed(2);
        formatted = `₹${Number(crore).toLocaleString("en-IN")} crore`;
      } else {
        const lakh = rawPrice.toFixed(2);
        formatted = `₹${Number(lakh).toLocaleString("en-IN")} lakh`;
      }
    }

    resultDiv.innerHTML = `Estimated Price: <strong>${formatted}</strong>`;
  } catch (err) {
    resultDiv.innerHTML = `<span style="color:red;">Error fetching prediction.</span>`;
    console.error(err);
  }

  resultDiv.classList.add("fade-in");
});