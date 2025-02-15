// Добавляем стили для графиков и тултипов
const styles = `
.category-container {
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.category-container h4 {
    margin: 0 0 10px 0;
    color: #333;
}

.chart-container {
    position: relative;
    width: 300px;
    height: 150px;
    margin: 10px 0;
    padding: 10px;
}

.chart-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    display: none;
    z-index: 1000;
    white-space: nowrap;
}

.chart-line {
    stroke: #2196F3;
    stroke-width: 2;
    fill: none;
}

.chart-point {
    fill: #2196F3;
    cursor: pointer;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

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

function createChart(measurements, container) {
    // Группируем измерения по категориям
    const measurementsByCategory = {};
    measurements.forEach(m => {
        if (!measurementsByCategory[m.category_name]) {
            measurementsByCategory[m.category_name] = [];
        }
        measurementsByCategory[m.category_name].push(m);
    });

    // Создаем контейнер для каждой категории
    Object.entries(measurementsByCategory).forEach(([categoryName, categoryMeasurements]) => {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'category-container';
        
        const categoryTitle = document.createElement('h4');
        categoryTitle.textContent = categoryName;
        categoryContainer.appendChild(categoryTitle);

        // Группируем измерения по компонентам внутри категории
        const measurementsByComponent = {};
        categoryMeasurements.forEach(m => {
            if (!measurementsByComponent[m.component_name]) {
                measurementsByComponent[m.component_name] = [];
            }
            measurementsByComponent[m.component_name].push(m);
        });

        // Создаем селект для выбора компонента
        const select = document.createElement('select');
        select.style.marginBottom = '10px';
        Object.keys(measurementsByComponent).forEach(componentName => {
            const option = document.createElement('option');
            option.value = componentName;
            option.textContent = componentName;
            select.appendChild(option);
        });
        categoryContainer.appendChild(select);

        // Создаем контейнер для графика этой категории
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        categoryContainer.appendChild(chartContainer);

        // Функция для создания графика конкретного компонента
        function createComponentChart(componentMeasurements) {
            chartContainer.innerHTML = ''; // Очищаем только контейнер конкретной категории
            
            const tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            chartContainer.appendChild(tooltip);

            const width = 300;
            const height = 150;
            const padding = 30;
            
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', width);
            svg.setAttribute('height', height);
            
            const values = componentMeasurements.map(m => parseFloat(m.value));
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            
            const xScale = (width - 2 * padding) / (componentMeasurements.length - 1);
            const yScale = (height - 2 * padding) / (maxValue - minValue || 1);
            
            // Рисуем оси
            const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            xAxis.setAttribute('d', `M ${padding} ${height - padding} H ${width - padding}`);
            xAxis.setAttribute('stroke', '#000');
            
            const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            yAxis.setAttribute('d', `M ${padding} ${padding} V ${height - padding}`);
            yAxis.setAttribute('stroke', '#000');
            
            svg.appendChild(xAxis);
            svg.appendChild(yAxis);

            // Y axis labels
            const yLabels = 5;
            for (let i = 0; i <= yLabels; i++) {
                const value = minValue + (maxValue - minValue) * (i / yLabels);
                const y = height - padding - (value - minValue) * yScale;
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', padding - 5);
                text.setAttribute('y', y);
                text.setAttribute('text-anchor', 'end');
                text.setAttribute('alignment-baseline', 'middle');
                text.setAttribute('font-size', '10');
                text.textContent = value.toFixed(1);
                svg.appendChild(text);
            }
            
            // Рисуем линию графика
            let pathD = '';
            const points = [];
            
            componentMeasurements.forEach((m, i) => {
                const x = padding + i * xScale;
                const y = height - padding - (m.value - minValue) * yScale;
                
                if (i === 0) {
                    pathD += `M ${x} ${y}`;
                } else {
                    pathD += ` L ${x} ${y}`;
                }
                
                points.push({ x, y, measurement: m });
            });
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathD);
            path.setAttribute('class', 'chart-line');
            svg.appendChild(path);
            
            // Добавляем точки и обработчики событий
            points.forEach(point => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', point.x);
                circle.setAttribute('cy', point.y);
                circle.setAttribute('r', '5');
                circle.setAttribute('class', 'chart-point');
                
                circle.addEventListener('mouseover', (e) => {
                    const [year, month, day] = point.measurement.measurement_date.split('-');
                    tooltip.style.display = 'block';
                    tooltip.style.left = `${e.clientX - chartContainer.getBoundingClientRect().left + 10}px`;
                    tooltip.style.top = `${e.clientY - chartContainer.getBoundingClientRect().top - 20}px`;
                    tooltip.innerHTML = `
                        Значення: ${point.measurement.value} ${point.measurement.unit}<br>
                        Дата: ${day}.${month}.${year}
                    `;
                    circle.setAttribute('r', '7');
                });
                
                circle.addEventListener('mouseout', () => {
                    tooltip.style.display = 'none';
                    circle.setAttribute('r', '5');
                });
                
                svg.appendChild(circle);
            });
            
            chartContainer.appendChild(svg);
        }

        // Обработчик изменения выбранного компонента
        select.addEventListener('change', () => {
            const selectedComponent = select.value;
            createComponentChart(measurementsByComponent[selectedComponent]);
        });

        // Изначально показываем первый компонент
        if (Object.keys(measurementsByComponent).length > 0) {
            const firstComponent = Object.keys(measurementsByComponent)[0];
            createComponentChart(measurementsByComponent[firstComponent]);
        }

        container.appendChild(categoryContainer);
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
    const container = document.createElement('div');
    container.className = 'info-window';
    
    const title = document.createElement('h3');
    title.textContent = factory.factory_name;
    container.appendChild(title);
    
    const coords = document.createElement('p');
    coords.textContent = `Координати: ${factory.latitude}, ${factory.longitude}`;
    container.appendChild(coords);

    createChart(factory.measurements, container);
    
    return container;
}

function updateDataTable(factories, selectedCategories) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    const headerRow = document.createElement('tr');
    const factoryHeader = document.createElement('th');
    factoryHeader.textContent = 'Назва фабрики';
    headerRow.appendChild(factoryHeader);
    
    selectedCategories.forEach(category => {
        const th = document.createElement('th');
        th.textContent = getCategoryDisplayName(category);
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    factories.forEach(factory => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = factory.factory_name;
        row.appendChild(nameCell);
        
        selectedCategories.forEach(category => {
            const cell = document.createElement('td');
            const measurements = factory.measurements.filter(m => 
                m.category_name.toLowerCase().includes(getCategoryKeyword(category))
            );
            
            if (measurements.length > 0) {
                createChart(measurements, cell);
            } else {
                cell.textContent = 'Немає даних';
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
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

(async function loadGoogleMaps() {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&libraries=&v=beta";
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
})();