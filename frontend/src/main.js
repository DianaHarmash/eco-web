// Dynamic loading of Google Maps
(async function loadGoogleMaps() {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&libraries=&v=beta";
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
})();

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { Marker } = await google.maps.importLibrary("marker");
    const { InfoWindow } = await google.maps.importLibrary("maps");

    const map = new Map(document.getElementById("map"), {
        center: { lat: 50.46002204159702, lng: 30.6198825268124 },
        zoom: 10,
    });

    // Fetch factories data from your API
    try {
        const response = await fetch('/api/web-eco/all-factories');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const factories = await response.json();

        // Create markers for each factory
        factories.forEach(factory => {
            const marker = new Marker({
                position: {
                    lat: parseFloat(factory.latitude),
                    lng: parseFloat(factory.longitude)
                },
                map: map,
                title: factory.factory_name
            });

            // Create info window content
            const content = `
                <div>
                    <h3>${factory.factory_name}</h3>
                    <p>Координаты:</p>
                    <ul>
                        <li>Широта: ${factory.latitude}</li>
                        <li>Долгота: ${factory.longitude}</li>
                    </ul>
                </div>
            `;

            const infoWindow = new InfoWindow({
                content: content
            });

            // Add click listener to show info window
            marker.addListener("click", () => {
                infoWindow.open(map, marker);
            });
        });

        // Also update the factory list in the sidebar
        const factoryListElement = document.getElementById('factoryList');
        factoryListElement.innerHTML = '';
        
        factories.forEach(factory => {
            const factoryElement = document.createElement('div');
            factoryElement.className = 'factory-item';
            factoryElement.innerHTML = `
                <h3>${factory.factory_name}</h3>
                <p>Координаты:</p>
                <ul>
                    <li>Широта: ${factory.latitude}</li>
                    <li>Долгота: ${factory.longitude}</li>
                </ul>
            `;
            factoryListElement.appendChild(factoryElement);
        });

    } catch (error) {
        console.error('Error fetching factories:', error);
        const factoryListElement = document.getElementById('factoryList');
        factoryListElement.innerHTML = `
            <div class="error">
                Произошла ошибка при загрузке данных: ${error.message}
            </div>
        `;
    }
}

// document.addEventListener('DOMContentLoaded', async () => {
//     const factoryListElement = document.getElementById('factoryList');

//     try {
//         const response = await fetch('/api/web-eco/all-factories');
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const factories = await response.json();
        
//         if (factories.length === 0) {
//             factoryListElement.innerHTML = '<p>Фабрики не найдены</p>';
//             return;
//         }

//         factoryListElement.innerHTML = '';

//         factories.forEach(factory => {
//             const factoryElement = document.createElement('div');
//             factoryElement.className = 'factory-item';
//             factoryElement.innerHTML = `
//                 <h3>${factory.factory_name}</h3>
//                 <p>Координаты:</p>
//                 <ul>
//                     <li>Широта: ${factory.latitude}</li>
//                     <li>Долгота: ${factory.longitude}</li>
//                 </ul>
//             `;
//             factoryListElement.appendChild(factoryElement);
//         });
//     } catch (error) {
//         console.error('Error fetching factories:', error);
//         factoryListElement.innerHTML = `
//             <div class="error">
//                 Произошла ошибка при загрузке данных: ${error.message}
//             </div>
//         `;
//     }
// });