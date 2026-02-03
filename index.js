// Load D3.js and DSCC from CDN dynamically
const d3Script = document.createElement('script');
d3Script.src = "https://d3js.org/d3.v7.min.js";
document.head.appendChild(d3Script);

const dsccScript = document.createElement('script');
dsccScript.src = "https://unpkg.com/@google/dscc";
document.head.appendChild(dsccScript);

d3Script.onload = () => {
  dsccScript.onload = () => {
    dscc.subscribeToData(drawViz, {transform: dscc.tableTransform});
  };
};

function drawViz(data) {
  // Clear any existing content
  document.body.innerHTML = '';
  const container = d3.select("body").append("div").attr("id", "viz");
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  const margin = 40;
  const outerRadius = Math.min(width, height) / 2 - margin;
  const innerRadius = outerRadius * 0.45;
  const ringWidth = (outerRadius - innerRadius) / 2.5;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Center "E"
  const centerChar = data.style.centerText.value || "E";
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .style("font-size", innerRadius * 0.9 + "px")
    .style("font-weight", "bold")
    .style("fill", "#6d0b2e")
    .text(centerChar);

  // Setup 28 days for February (or 31 for others)
  const totalDays = 28; 
  const angleScale = d3.scaleLinear().domain([0, totalDays]).range([0, 2 * Math.PI]);
  const arc = d3.arc();

  const rows = data.tables.DEFAULT;

  for (let i = 0; i < totalDays; i++) {
    const dayNum = i + 1;
    const dayData = rows.find(r => parseInt(r.dateDim[0]) === dayNum);

    // Outer Ring: Incidents
    svg.append("path")
      .attr("d", arc({
        innerRadius: outerRadius - ringWidth,
        outerRadius: outerRadius,
        startAngle: angleScale(i),
        endAngle: angleScale(i + 1),
        padAngle: 0.03
      }))
      .attr("fill", dayData && dayData.incidentMetric[0] > 0 ? "#d9534f" : "#e0e0e0");

    // Inner Ring: Near Misses
    svg.append("path")
      .attr("d", arc({
        innerRadius: outerRadius - (ringWidth * 2) - 4,
        outerRadius: outerRadius - ringWidth - 4,
        startAngle: angleScale(i),
        endAngle: angleScale(i + 1),
        padAngle: 0.03
      }))
      .attr("fill", dayData && dayData.nearMissMetric[0] > 0 ? "#5cb85c" : "#e0e0e0");

    // Labels
    const angle = angleScale(i + 0.5);
    const x = Math.sin(angle) * (outerRadius + 20);
    const y = -Math.cos(angle) * (outerRadius + 20);
    
    svg.append("text")
      .attr("x", x).attr("y", y)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#666")
      .text(dayNum);
  }
}
