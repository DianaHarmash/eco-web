let map;
let markers = [];
let factoriesData = [];

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { Marker } = await google.maps.importLibrary("marker");
    const { InfoWindow } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 50.46002204159702, lng: 30.6198825268124 },
        zoom: 10,
    });

    try {
        const response = await fetch('/api/web-eco/all-factories-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        factoriesData = await response.json();
        setupEventListeners();
        updateMarkersAndTable();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function setupEventListeners() {
    const checkboxes = document.querySelectorAll('#marker-options input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateMarkersAndTable);
    });
}

function updateMarkersAndTable() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    const selectedCategories = Array.from(
        document.querySelectorAll('#marker-options input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);

    const filteredFactories = factoriesData.filter(factory => {
        return factory.measurements.some(measurement => {
            const categoryName = measurement.category_name.toLowerCase();
            return selectedCategories.some(category => 
                categoryName.includes(getCategoryKeyword(category))
            );
        });
    });

    filteredFactories.forEach(factory => {
        const marker = new google.maps.Marker({
            position: {
                lat: parseFloat(factory.latitude),
                lng: parseFloat(factory.longitude)
            },
            map: map,
            title: factory.factory_name
        });

        const infoWindow = new google.maps.InfoWindow({
            content: createInfoWindowContent(factory)
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    });

    updateDataTable(filteredFactories, selectedCategories);
}

function getCategoryKeyword(category) {
    const categoryMap = {
        'air': 'повітря',
        'water': 'водн',
        'ground': 'ґрунт',
        'radiation': 'радіац',
        'economy': 'економічн',
        'health': 'здоров',
        'energy': 'енергетичн'
    };
    return categoryMap[category];
}

function createInfoWindowContent(factory) {
    let content = `
        <div class="info-window">
            <h3>${factory.factory_name}</h3>
            <p>Координати: ${factory.latitude}, ${factory.longitude}</p>
            <h4>Показники:</h4>
    `;

    const measurementsByCategory = {};
    factory.measurements.forEach(m => {
        if (!measurementsByCategory[m.category_name]) {
            measurementsByCategory[m.category_name] = [];
        }
        measurementsByCategory[m.category_name].push(m);
    });

    Object.entries(measurementsByCategory).forEach(([category, measurements]) => {
        content += `<p><strong>${category}:</strong></p><ul>`;
        measurements.forEach(m => {
            content += `<li>${m.component_name}: ${m.value} ${m.unit}</li>`;
        });
        content += '</ul>';
    });

    content += '</div>';
    return content;
}

function updateDataTable(factories, selectedCategories) {
    const tableContainer = document.getElementById('tableContainer');
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Назва фабрики</th>
                    ${selectedCategories.map(category => `
                        <th>${getCategoryDisplayName(category)}</th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
    `;

    factories.forEach(factory => {
        html += `<tr>
            <td>${factory.factory_name}</td>`;
        selectedCategories.forEach(category => {
            const categoryMeasurements = factory.measurements.filter(m => 
                m.category_name.toLowerCase().includes(getCategoryKeyword(category))
            );
            html += `<td>${formatMeasurements(categoryMeasurements)}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function getCategoryDisplayName(category) {
    const displayNames = {
        'air': 'Стан повітря',
        'water': 'Стан водних ресурсів',
        'ground': 'Стан ґрунтів',
        'radiation': 'Рівень радіації',
        'economy': 'Економічний стан',
        'health': 'Стан здоров\'я населення',
        'energy': 'Енергетичний стан'
    };
    return displayNames[category];
}

function formatMeasurements(measurements) {
    if (measurements.length === 0) return 'Немає даних';
    return measurements.map(m => 
        `${m.component_name}: ${m.value} ${m.unit}`
    ).join('<br>');
}

(async function loadGoogleMaps() {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&libraries=&v=beta";
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
})();

