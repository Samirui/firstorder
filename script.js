let gisData = [];
let map;
let markerLayer = L.layerGroup();
let currentPopup;

// Function to initialize the map
function initMap() {
    map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markerLayer.addTo(map);
    map.on('click', function(event) {
        console.log('Clicked on map at:', event.latlng);
    });
}

// Function to load the file
function loadFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const text = event.target.result;
        parseCSV(text);
    };

    reader.readAsText(file);
}

// Function to parse CSV data
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');

    gisData = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
            PointID: values[0],
            Latitude: parseFloat(values[1]),
            Longitude: parseFloat(values[2]),
            OrthHght: values[3],
            Location: values[4]
        };
    });

    console.log('GIS Data:', gisData);

    // Add markers for each point
    gisData.forEach(point => addMarker(point));
}

// Function to search a point by Point ID
function search() {
    const searchValue = document.getElementById('searchValue').value;
    const result = gisData.find(point => point.PointID === searchValue);

    if (result) {
        showEditForm(result);
        map.setView([result.Latitude, result.Longitude], 12); // Zoom to the marker
    } else {
        alert('Point not found');
        document.getElementById('editForm').style.display = 'none';
    }
}

// Function to show the edit form with current point data
function showEditForm(point) {
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('editPointID').value = point.PointID;
    document.getElementById('editLatitude').value = point.Latitude;
    document.getElementById('editLongitude').value = point.Longitude;
    document.getElementById('editOrthHght').value = point.OrthHght;
    document.getElementById('editLocation').value = point.Location;
}

// Function to update the point data
function update() {
    const pointID = document.getElementById('editPointID').value;
    const pointIndex = gisData.findIndex(point => point.PointID === pointID);

    if (pointIndex !== -1) {
        gisData[pointIndex] = {
            PointID: pointID,
            Latitude: parseFloat(document.getElementById('editLatitude').value),
            Longitude: parseFloat(document.getElementById('editLongitude').value),
            OrthHght: document.getElementById('editOrthHght').value,
            Location: document.getElementById('editLocation').value
        };

        console.log('Updated GIS Data:', gisData);
        alert('Point updated successfully');
        document.getElementById('editForm').style.display = 'none';
        updateMarker(gisData[pointIndex]);
    }
}

// Function to cancel the edit
function cancelEdit() {
    document.getElementById('editForm').style.display = 'none';
}

// Function to show the add form
function showAddForm() {
    document.getElementById('addForm').style.display = 'block';
}

// Function to cancel adding a point
function cancelAdd() {
    document.getElementById('addForm').style.display = 'none';
}

// Function to add a new point
function add() {
    const newPoint = {
        PointID: document.getElementById('addPointID').value,
        Latitude: parseFloat(document.getElementById('addLatitude').value),
        Longitude: parseFloat(document.getElementById('addLongitude').value),
        OrthHght: document.getElementById('addOrthHght').value,
        Location: document.getElementById('addLocation').value
    };

    gisData.push(newPoint);
    console.log('Added new point:', newPoint);
    alert('Point added successfully');
    document.getElementById('addForm').style.display = 'none';
    addMarker(newPoint);
    map.setView([newPoint.Latitude, newPoint.Longitude], 12); // Zoom to the marker
}

// Function to delete a point
function deletePoint(pointID) {
    const pointIndex = gisData.findIndex(point => point.PointID === pointID);

    if (pointIndex !== -1) {
        gisData.splice(pointIndex, 1);
        console.log('Deleted point with ID:', pointID);
        alert('Point deleted successfully');
        document.getElementById('editForm').style.display = 'none';
        removeMarker(pointID);
    }
}

// Function to add a marker on the map
// Function to add a marker on the map
function addMarker(point) {
    const marker = L.marker([point.Latitude, point.Longitude])
        .bindPopup(`
            <b>Point ID:</b> ${point.PointID}<br>
            <b>Latitude:</b> ${point.Latitude}<br>
            <b>Longitude:</b> ${point.Longitude}<br>
            <b>Location:</b> ${point.Location}<br>
            <b>Orth Hght:</b> ${point.OrthHght}
        `)
        .addTo(markerLayer)
        .on('click', function() {
            // Close popups of other markers
            markerLayer.eachLayer(function(layer) {
                if (layer !== marker && layer.isPopupOpen()) {
                    layer.closePopup();
                }
            });
        });

    marker._pointID = point.PointID;  // Custom property to identify marker
}


// Function to update a marker on the map
function updateMarker(point) {
    const marker = markerLayer.getLayers().find(marker => marker._pointID === point.PointID);
    if (marker) {
        marker.setLatLng([point.Latitude, point.Longitude])
            .setPopupContent(`ID: ${point.PointID}<br>Location: ${point.Location}<br>Latitude: ${point.Latitude}<br>Longitude: ${point.Longitude}`);
    }
}

// Function to remove a marker from the map
function removeMarker(pointID) {
    const marker = markerLayer.getLayers().find(marker => marker._pointID === pointID);
    if (marker) {
        markerLayer.removeLayer(marker);
    }
}

// Initialize the map on page load
document.addEventListener('DOMContentLoaded', initMap);
