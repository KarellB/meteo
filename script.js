async function loadData() {
  const response = await fetch("data.csv"); // CSV musí být ve stejné složce
  const text = await response.text();

  const rows = text.split("\n").slice(1); // bez hlavičky

  const data = rows.map(row => {
    const cols = row.split(";");
    if (cols.length < 6) return null;

    const datetime = new Date(cols[0].split(".").reverse().join("-") + "T" + cols[1]);
    const temp = parseFloat(cols[2].replace(",", "."));
    const hum = parseFloat(cols[3].replace(",", "."));
    const press = parseFloat(cols[4].replace(",", "."));
    const wind = parseFloat(cols[5].replace(",", "."));

    return { datetime, temp, hum, press, wind };
  }).filter(x => x !== null);

  // poslední 3 hodiny
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  return data.filter(d => d.datetime >= threeHoursAgo);
}

function createChart(ctx, label, data, key) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map(d => d.datetime.toLocaleTimeString()),
      datasets: [{
        label: label,
        data: data.map(d => d[key]),
        fill: false,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { display: true },
        y: { display: true }
      }
    }
  });
}

async function init() {
  const data = await loadData();

  createChart(document.getElementById("tempChart"), "Teplota (°C)", data, "temp");
  createChart(document.getElementById("humChart"), "Vlhkost (%)", data, "hum");
  createChart(document.getElementById("pressChart"), "Tlak (hPa)", data, "press");
  createChart(document.getElementById("windChart"), "Vítr (m/s)", data, "wind");
}

init();
