// Old Tafo Municipal boundaries: Lat 6.68°N - 6.71°N, Lng -1.63°W - -1.59°W
let streetLights = [
  {
    id: "SL-01",
    lat: 6.7368,
    lng: -1.6123,
    status: "on",
    lastUpdate: new Date(),
    location: "Tafo Lorry Station – Main Ticket Booth",
  },
  {
    id: "SL-02",
    lat: 6.7365,
    lng: -1.6125,
    status: "on",
    lastUpdate: new Date(),
    location: "Tafo Lorry Station – GCB Bank ATM Area",
  },
  {
    id: "SL-03",
    lat: 6.7340,
    lng: -1.6120,
    status: "on",
    lastUpdate: new Date(),
    location: "Holy Family Hospital – Out-Patient Department",  // Aligned to Tafo Government Hospital (local match in Old Tafo)
  },
  {
    id: "SL-04",
    lat: 6.7350,
    lng: -1.6120,
    status: "on",
    lastUpdate: new Date(),
    location: "Old Tafo Main Road – Near Tafo Market Junction",
  },
  {
    id: "SL-05",
    lat: 6.7355,
    lng: -1.6125,
    status: "fault",
    lastUpdate: new Date(),
    location: "Old Tafo Central Market – Fabric Stalls",
  },
  {
    id: "SL-06",
    lat: 6.7345,
    lng: -1.6140,
    status: "on",
    lastUpdate: new Date(),
    location: "Market Road – Behind Fire Service Station",
  },
  {
    id: "SL-07",
    lat: 6.7339,
    lng: -1.6130,
    status: "off",
    lastUpdate: new Date(),
    location: "Tafo Old Police Station – Junction",
  },
  {
    id: "SL-08",
    lat: 6.7430,
    lng: -1.6046,
    status: "on",
    lastUpdate: new Date(),
    location: "Pankrono Road – Opposite LPG Station",
  },
  {
    id: "SL-09",
    lat: 6.7411,
    lng: -1.6053,
    status: "on",
    lastUpdate: new Date(),
    location: "Pankrono Estate – Main Entrance ('A' Line)",
  },
  {
    id: "SL-010",
    lat: 6.7415,
    lng: -1.6058,
    status: "on",
    lastUpdate: new Date(),
    location: "Pankrono Estate – 'B' Line North",
  },
  {
    id: "SL-011",
    lat: 6.7020,
    lng: -1.6100,
    status: "on",
    lastUpdate: new Date(),
    location: "Bohyen Main Street – Near Shell Filling Station",
  },
  {
    id: "SL-012",
    lat: 6.7025,
    lng: -1.6095,
    status: "off",
    lastUpdate: new Date(),
    location: "Bohyen – North End (Main Junction)",
  },
  {
    id: "SL-013",
    lat: 6.7013,
    lng: -1.6123,
    status: "on",
    lastUpdate: new Date(),
    location: "Northern Extension – Bohyen Link (West)",
  },
  {
    id: "SL-014",
    lat: 6.7350,
    lng: -1.6100,
    status: "on",
    lastUpdate: new Date(),
    location: "Eastern Road – Tafo SDA School Junction",
  },
  {
    id: "SL-015",
    lat: 6.7345,
    lng: -1.6105,
    status: "fault",
    lastUpdate: new Date(),
    location: "Eastern Road – Before SDA Church",
  },
  {
    id: "SL-016",
    lat: 6.7100,
    lng: -1.6150,
    status: "on",
    lastUpdate: new Date(),
    location: "Tafo–Nhyiaeso Link Road – Middle Bend",
  },
  {
    id: "SL-017",
    lat: 6.7223,
    lng: -1.6140,
    status: "on",
    lastUpdate: new Date(),
    location: "Southern Link – Near Pentecost Church (Tafo)",
  },
  {
    id: "SL-018",
    lat: 6.7330,
    lng: -1.6135,
    status: "off",
    lastUpdate: new Date(),
    location: "Tafo Methodist Street – North End",
  },
  {
    id: "SL-019",
    lat: 6.6995,
    lng: -1.6115,
    status: "on",
    lastUpdate: new Date(),
    location: "OKESS – Access Road",
  },
  {
    id: "SL-020",
    lat: 6.7400,
    lng: -1.6060,
    status: "on",
    lastUpdate: new Date(),
    location: "Pankrono-Adabraka Link Road",
  },
];

// Auto-scroll intervals
let activeScrollInterval = null;
let faultyScrollInterval = null;

// Mapbox variables
let map = null;
let markers = [];
let currentFilter = "all";
let currentMapStyle = "streets-v12";

// Initialize Mapbox
function initializeMap() {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiaGV5eXdpbGx6IiwiYSI6ImNtaGJ1aHJwZzA3NXoyanNhMHVhM2p4MTcifQ.avw3j-E6v4MDSp4R6a6J2A";

  // Calculate center point from all streetlights
  const centerLat =
    streetLights.reduce((sum, light) => sum + light.lat, 0) /
    streetLights.length;
  const centerLng =
    streetLights.reduce((sum, light) => sum + light.lng, 0) /
    streetLights.length;

  map = new mapboxgl.Map({
    container: "mapContainer",
    style: `mapbox://styles/mapbox/${currentMapStyle}`,
    center: [centerLng, centerLat],
    zoom: 14,
    minZoom: 12,
    maxZoom: 18,
  });

  // Add navigation controls (includes zoom buttons)
  map.addControl(new mapboxgl.NavigationControl(), "top-right");

  // Add scale control
  map.addControl(
    new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: "metric",
    }),
    "bottom-left"
  );

  // Wait for map to load before adding markers and legend
  map.on("load", () => {
    addMarkersToMap();
    createMapLegend();
  });
}

// Create map style switcher legend
function createMapLegend() {
  const mapPlaceholder = document.querySelector(".map-placeholder");

  // Remove existing legend if any
  const existingLegend = mapPlaceholder.querySelector(".map-legend");
  if (existingLegend) {
    existingLegend.remove();
  }

  const legendDiv = document.createElement("div");
  legendDiv.className = "map-legend";
  legendDiv.innerHTML = `
    <div class="legend-title">Map Style</div>
    <div class="legend-options">
      <button class="legend-btn ${
        currentMapStyle === "streets-v12" ? "active" : ""
      }" data-style="streets-v12">
        <i class="fas fa-map"></i>
        <span>Streets</span>
      </button>
      <button class="legend-btn ${
        currentMapStyle === "satellite-streets-v12" ? "active" : ""
      }" data-style="satellite-streets-v12">
        <i class="fas fa-satellite"></i>
        <span>Satellite</span>
      </button>
    </div>
  `;

  mapPlaceholder.appendChild(legendDiv);

  // Add event listeners to legend buttons
  const legendButtons = legendDiv.querySelectorAll(".legend-btn");
  legendButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const style = this.getAttribute("data-style");
      switchMapStyle(style);

      // Update active state
      legendButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

// Switch map style
function switchMapStyle(style) {
  if (!map) return;

  currentMapStyle = style;
  map.setStyle(`mapbox://styles/mapbox/${style}`);

  // Re-add markers after style loads
  map.once("style.load", () => {
    addMarkersToMap(currentFilter);
  });
}

// Create custom marker element
function createMarkerElement(light) {
  const el = document.createElement("div");
  el.className = "custom-marker";
  el.dataset.status = light.status;
  el.dataset.id = light.id;

  // Set marker color and Font Awesome icon based on status
  let color;
  let iconClass;
  switch (light.status) {
    case "on":
      color = "#10b981";
      iconClass = "fas fa-lightbulb";
      break;
    case "off":
      color = "#6b7280";
      iconClass = "fas fa-lightbulb";
      break;
    case "fault":
      color = "#ef4444";
      iconClass = "fas fa-triangle-exclamation";
      break;
  }

  el.innerHTML = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      color: white;
    " class="marker-inner">
      <i class="${iconClass}" style="font-size: 14px;"></i>
    </div>
  `;

  // Add hover effect
  el.addEventListener("mouseenter", function () {
    this.querySelector(".marker-inner").style.transform = "scale(1.3)";
  });

  el.addEventListener("mouseleave", function () {
    this.querySelector(".marker-inner").style.transform = "scale(1)";
  });

  return el;
}

// Create popup content
function createPopupContent(light) {
  const statusText = {
    on: "ON",
    off: "OFF",
    fault: "FAULT",
  };

  const statusColor = {
    on: "#10b981",
    off: "#6b7280",
    fault: "#ef4444",
  };

  // Create Google Maps directions URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${light.lat},${light.lng}`;

  return `
    <div style="padding: 8px; min-width: 220px;">
      <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 1.1rem;">
        ${light.id}
      </h3>
      <div style="margin-bottom: 6px; color: #6c757d; font-size: 0.85rem;">
        <strong>Location:</strong><br/>
        ${light.location}
      </div>
      <div style="margin-bottom: 6px; color: #6c757d; font-size: 0.85rem;">
        <strong>Coordinates:</strong><br/>
        ${light.lat.toFixed(4)}, ${light.lng.toFixed(4)}
      </div>
      <div style="margin-bottom: 6px;">
        <span style="
          background-color: ${statusColor[light.status]};
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-block;
        ">
          ${statusText[light.status]}
        </span>
      </div>
      <div style="color: #9ca3af; font-size: 0.75rem; margin-top: 8px; margin-bottom: 12px;">
        ${timeAgo(light.lastUpdate)}
      </div>
      <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 8px 16px;
        background-color: #3b82f6;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        transition: background-color 0.2s ease;
        font-family: 'Poppins', sans-serif;
      " onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">
        <i class="fas fa-map-marked-alt"></i>
        Get Directions
      </a>
    </div>
  `;
}

// Add markers to map
function addMarkersToMap(filter = "all") {
  // Remove existing markers
  markers.forEach((marker) => marker.remove());
  markers = [];

  // Filter lights based on current filter
  let lightsToShow = streetLights;
  if (filter === "active") {
    lightsToShow = streetLights.filter(
      (l) => l.status === "on" || l.status === "off"
    );
  } else if (filter === "fault") {
    lightsToShow = streetLights.filter((l) => l.status === "fault");
  }

  // Add markers for filtered lights
  lightsToShow.forEach((light) => {
    const el = createMarkerElement(light);

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false,
    }).setHTML(createPopupContent(light));

    const marker = new mapboxgl.Marker(el)
      .setLngLat([light.lng, light.lat])
      .setPopup(popup)
      .addTo(map);

    markers.push(marker);
  });

  // Update map info
  updateMapInfo(filter, lightsToShow.length);
}

// Update map info display
function updateMapInfo(filter, count) {
  const mapPlaceholder = document.querySelector(".map-placeholder");
  if (!mapPlaceholder) return;

  let filterText = "";
  let filterColor = "";

  switch (filter) {
    case "all":
      filterText = "All Streetlights";
      filterColor = "#3b82f6";
      break;
    case "active":
      filterText = "Active Lights";
      filterColor = "#10b981";
      break;
    case "fault":
      filterText = "Faulty Lights";
      filterColor = "#ef4444";
      break;
  }

  // Check if info box already exists
  let infoBox = mapPlaceholder.querySelector(".map-info-box");
  if (!infoBox) {
    infoBox = document.createElement("div");
    infoBox.className = "map-info-box";
    mapPlaceholder.appendChild(infoBox);
  }

  infoBox.innerHTML = `
    <div style="font-size: 0.75rem; color: #6c757d; margin-bottom: 4px;">
      Showing:
    </div>
    <div style="font-size: 0.8rem; font-weight: 600; color: ${filterColor};">
      ${filterText}
    </div>
    <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 4px;">
      ${count} location${count !== 1 ? "s" : ""}
    </div>
    <div style="font-size: 0.7rem; color: #9ca3af; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e9ecef;">
   Old Tafo Municipal, Kumasi
    </div>
  `;
}

// Update markers when status changes
function updateMapMarkers() {
  if (!map) return;
  addMarkersToMap(currentFilter);
}

// Calculate statistics
function calculateStats() {
  const total = streetLights.length;
  const on = streetLights.filter((l) => l.status === "on").length;
  const off = streetLights.filter((l) => l.status === "off").length;
  const fault = streetLights.filter((l) => l.status === "fault").length;

  return {
    total,
    on,
    off,
    fault,
    active: on + off,
    onPercent: Math.round((on / total) * 100),
    offPercent: Math.round((off / total) * 100),
    faultPercent: Math.round((fault / total) * 100),
  };
}

// Update dashboard statistics
function updateStats() {
  const stats = calculateStats();

  document.getElementById("totalLights").textContent = stats.total;
  document.getElementById("onLights").textContent = stats.on;
  document.getElementById("offLights").textContent = stats.off;
  document.getElementById("faultLights").textContent = stats.fault;

  document.getElementById("onPercent").textContent = stats.onPercent + "%";
  document.getElementById("offPercent").textContent = stats.offPercent + "%";
  document.getElementById("faultPercent").textContent =
    stats.faultPercent + "%";

  document.getElementById("activeBadge").textContent = stats.active;
  document.getElementById("faultBadge").textContent = stats.fault;
}

// Format time ago
function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `Updated ${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0)
    return `Updated ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Updated just now";
}

// Render light item HTML
function renderLightItem(light) {
  const statusIcons = {
    on: '<i class="fas fa-lightbulb"></i> ON',
    off: '<i class="fas fa-lightbulb"></i> OFF',
    fault: '<i class="fas fa-triangle-exclamation"></i> FAULT',
  };

  return `
    <div class="light-item" data-id="${light.id}">
      <div class="light-info-wrapper">
        <div class="light-id">
          <i class="fas fa-map-marker-alt light-icon"></i>
          ${light.id}
        </div>
        <div class="light-location">${light.location}</div>
        <div class="light-coordinates">${light.lat.toFixed(
          4
        )}, ${light.lng.toFixed(4)}</div>
      </div>
      <div class="status-info">
      <span class="light-status ${light.status}">
        ${statusIcons[light.status]}
      </span>
      <div class="light-update">${timeAgo(light.lastUpdate)}</div>
      </div>
    </div>
  `;
}

// Auto-scroll function for active lights
function autoScrollActiveLights() {
  const container = document.getElementById("activeLightsList");
  if (!container) return;

  if (activeScrollInterval) {
    clearInterval(activeScrollInterval);
  }

  activeScrollInterval = setInterval(() => {
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll <= 0) return;

    const currentScroll = container.scrollTop;
    const scrollAmount = 90 * 4;

    if (currentScroll + scrollAmount >= maxScroll) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ top: scrollAmount, behavior: "smooth" });
    }
  }, 2000);
}

// Auto-scroll function for faulty lights
function autoScrollFaultyLights() {
  const container = document.getElementById("faultyLightsList");
  if (!container) return;

  if (faultyScrollInterval) {
    clearInterval(faultyScrollInterval);
  }

  faultyScrollInterval = setInterval(() => {
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll <= 0) return;

    const currentScroll = container.scrollTop;
    const scrollAmount = 90 * 4;

    if (currentScroll - scrollAmount <= 0) {
      container.scrollTo({ top: maxScroll, behavior: "smooth" });
    } else {
      container.scrollBy({ top: -scrollAmount, behavior: "smooth" });
    }
  }, 2500);
}

// Pause auto-scroll on manual interaction
function setupScrollPause(containerId, restartFunction) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let scrollTimeout;

  container.addEventListener("scroll", () => {
    if (containerId === "activeLightsList" && activeScrollInterval) {
      clearInterval(activeScrollInterval);
      activeScrollInterval = null;
    } else if (containerId === "faultyLightsList" && faultyScrollInterval) {
      clearInterval(faultyScrollInterval);
      faultyScrollInterval = null;
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      restartFunction();
    }, 3000);
  });

  container.addEventListener("mouseenter", () => {
    if (containerId === "activeLightsList" && activeScrollInterval) {
      clearInterval(activeScrollInterval);
      activeScrollInterval = null;
    } else if (containerId === "faultyLightsList" && faultyScrollInterval) {
      clearInterval(faultyScrollInterval);
      faultyScrollInterval = null;
    }
  });

  container.addEventListener("mouseleave", () => {
    restartFunction();
  });
}

// Render streetlight lists
function renderLightLists() {
  const activeLights = streetLights.filter(
    (l) => l.status === "on" || l.status === "off"
  );
  const faultyLights = streetLights.filter((l) => l.status === "fault");

  const activeLightsList = document.getElementById("activeLightsList");
  const faultyLightsList = document.getElementById("faultyLightsList");

  activeLightsList.innerHTML = activeLights.map(renderLightItem).join("");
  faultyLightsList.innerHTML =
    faultyLights.length > 0
      ? faultyLights.map(renderLightItem).join("")
      : '<div style="text-align: center; color: #9ca3af; padding: 2rem;">No faulty lights detected</div>';

  setTimeout(() => {
    autoScrollActiveLights();
    autoScrollFaultyLights();
  }, 250);
}

// Simulate random status changes
function simulateStatusChanges() {
  setInterval(() => {
    const numChanges = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numChanges; i++) {
      const randomIndex = Math.floor(Math.random() * streetLights.length);
      const statuses = ["on", "off", "fault"];
      const currentStatus = streetLights[randomIndex].status;

      let newStatus = currentStatus;
      while (newStatus === currentStatus) {
        newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      }

      streetLights[randomIndex].status = newStatus;
      streetLights[randomIndex].lastUpdate = new Date();
    }

    updateStats();
    renderLightLists();
    updateMapMarkers();
  }, 10000);
}

// Update timestamps
function updateTimestamps() {
  setInterval(() => {
    renderLightLists();
  }, 30000);
}

// View switching functionality
const navLinks = document.querySelectorAll("nav a");
const views = {
  status: document.getElementById("statusView"),
  map: document.getElementById("mapView"),
  about: document.getElementById("aboutView"),
};

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const viewName = link.getAttribute("data-view");

    navLinks.forEach((l) => l.parentElement.classList.remove("active"));
    link.parentElement.classList.add("active");

    Object.keys(views).forEach((key) => {
      views[key].style.display = key === viewName ? "block" : "none";
    });

    if (viewName === "status") {
      setTimeout(() => {
        autoScrollActiveLights();
        autoScrollFaultyLights();
      }, 300);
    } else if (viewName === "map") {
      if (!map) {
        initializeMap();
      } else {
        map.resize();
        addMarkersToMap(currentFilter);
      }
    }

    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    }
  });
});

// Map view buttons
document.getElementById("viewActiveMapBtn").addEventListener("click", () => {
  currentFilter = "active";

  navLinks.forEach((l) => l.parentElement.classList.remove("active"));
  document
    .querySelector('[data-view="map"]')
    .parentElement.classList.add("active");

  Object.keys(views).forEach((key) => {
    views[key].style.display = key === "map" ? "block" : "none";
  });

  if (!map) {
    initializeMap();
  } else {
    map.resize();
    addMarkersToMap("active");
  }

  if (window.innerWidth <= 768) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
});

document.getElementById("viewFaultMapBtn").addEventListener("click", () => {
  currentFilter = "fault";

  navLinks.forEach((l) => l.parentElement.classList.remove("active"));
  document
    .querySelector('[data-view="map"]')
    .parentElement.classList.add("active");

  Object.keys(views).forEach((key) => {
    views[key].style.display = key === "map" ? "block" : "none";
  });

  if (!map) {
    initializeMap();
  } else {
    map.resize();
    addMarkersToMap("fault");
  }

  if (window.innerWidth <= 768) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
});

// Mobile menu functionality
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  renderLightLists();
  simulateStatusChanges();
  updateTimestamps();

  setupScrollPause("activeLightsList", autoScrollActiveLights);
  setupScrollPause("faultyLightsList", autoScrollFaultyLights);
});
