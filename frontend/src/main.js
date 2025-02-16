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

const categoryComponents = {
    air: [
        'Вміст пилу',
        'Двоокис азоту (NO2)',
        'Двоокис сірки (SO2)',
        'Оксид вуглецю',
        'Формальдегід (H2CO)',
        'Свинець',
        'Бенз(а)пірен',
        'Iндекс якості повітря'
    ],
    water: [
        'Показники епідемічної безпеки (мікробіологічні)',
        'Показники епідемічної безпеки (паразитарні)',
        'Санітарно-хімічні (органолептичні)',
        'Санітарно-хімічні (фізико-хімічні)',
        'Санітарно-хімічні (санітарно-токсикологічні)',
        'Радіаційні показники',
        'Індекс забрудненості води'
    ],
    ground: [
        'Гумус',
        'Рухомі сполуки фосфору (P2O5)',
        'Рухомі сполуки калію (K2O)',
        'Засоленість',
        'Солонцюватість',
        'Забруднення хімічними речовинами',
        'pH',
        'Бал бонітету для складового ґрунту'
    ],
    radiation: [
        'Рівень радіації',
        'Placeholder'
    ],
    economy: [
        'Валовий внутрішній продукт',
        'Вантажообіг',
        'Пасажирообіг',
        'Експорт товарів та послуг',
        'Імпорт товарів та послуг',
        'Заробітна плата',
        'Індекс промислової продукції',
        'Індекс обсягу сільськогосподарського виробництва',
        'Індекс будівельної продукції',
        'Індекс споживчих цін',
        'Індекс цін виробників промислової продукції'
    ],
    health: [
        'Медико-демографічні показники',
        'Показники захворюваності та поширення хвороб (хворобливість)',
        'Інвалідності та інвалідизації',
        'Фізичного розвитку населення',
        'Ризики захворювання',
        'Прогноз захворювання',
        'Прогноз тривалості життя'
    ],
    energy: [
        'Обсяги використання води',
        'Обсяги використання електроенергії',
        'Обсяги використання газу',
        'Обсяги використання теплової енергії за кожен місяць',
        'Середні обсяги споживання за місяць та рік',
        'Енергоефективність будівлі або виробництва'
    ]
};

let categoryFilters = {
    air: true,
    water: true,
    ground: true,
    radiation: true,
    economy: true,
    health: true,
    energy: true
};

let componentFilters = {};

function initComponentFilters() {
    Object.values(categoryComponents).flat().forEach(component => {
        componentFilters[component] = true;
    });
}

function createChart(measurements, container) {
    const measurementsByCategory = {};
    measurements.forEach(m => {
        if (!measurementsByCategory[m.category_name]) {
            measurementsByCategory[m.category_name] = [];
        }
        measurementsByCategory[m.category_name].push(m);
    });

    Object.entries(measurementsByCategory).forEach(([categoryName, categoryMeasurements]) => {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'category-container';
        
        const categoryTitle = document.createElement('h4');
        categoryTitle.textContent = categoryName;
        categoryContainer.appendChild(categoryTitle);

        const measurementsByComponent = {};
        categoryMeasurements.forEach(m => {
            if (!measurementsByComponent[m.component_name]) {
                measurementsByComponent[m.component_name] = [];
            }
            measurementsByComponent[m.component_name].push(m);
        });

        const select = document.createElement('select');
        select.style.marginBottom = '10px';
        Object.keys(measurementsByComponent).forEach(componentName => {
            const option = document.createElement('option');
            option.value = componentName;
            option.textContent = componentName;
            select.appendChild(option);
        });
        categoryContainer.appendChild(select);

        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        categoryContainer.appendChild(chartContainer);

        function createComponentChart(componentMeasurements) {
            chartContainer.innerHTML = ''; 

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
            
            const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            xAxis.setAttribute('d', `M ${padding} ${height - padding} H ${width - padding}`);
            xAxis.setAttribute('stroke', '#000');
            
            const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            yAxis.setAttribute('d', `M ${padding} ${padding} V ${height - padding}`);
            yAxis.setAttribute('stroke', '#000');
            
            svg.appendChild(xAxis);
            svg.appendChild(yAxis);

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

        select.addEventListener('change', () => {
            const selectedComponent = select.value;
            createComponentChart(measurementsByComponent[selectedComponent]);
        });

        if (Object.keys(measurementsByComponent).length > 0) {
            const firstComponent = Object.keys(measurementsByComponent)[0];
            createComponentChart(measurementsByComponent[firstComponent]);
        }

        container.appendChild(categoryContainer);
    });
}

function createFilterPanel() {
    const filterPanel = document.getElementById('filterPanel');
    filterPanel.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'flex';

    const categoryPanel = document.createElement('div');
    categoryPanel.className = 'w-64 p-4 border-r';
    
    const categoryTitle = document.createElement('h3');
    categoryTitle.className = 'text-lg font-bold mb-4';
    categoryTitle.textContent = 'Категорії';
    categoryPanel.appendChild(categoryTitle);

    Object.entries(categoryFilters).forEach(([category, checked]) => {
        const label = document.createElement('label');
        label.className = 'flex items-center mb-2';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.className = 'mr-2';
        checkbox.addEventListener('change', () => handleCategoryChange(category));

        const span = document.createElement('span');
        span.textContent = getCategoryDisplayName(category);

        label.appendChild(checkbox);
        label.appendChild(span);
        categoryPanel.appendChild(label);
    });

    const componentPanel = document.createElement('div');
    componentPanel.className = 'w-96 p-4 max-h-screen overflow-y-auto';

    const componentTitle = document.createElement('h3');
    componentTitle.className = 'text-lg font-bold mb-4';
    componentTitle.textContent = 'Компоненти';
    componentPanel.appendChild(componentTitle);

    Object.entries(categoryComponents).forEach(([category, components]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = `mb-4 ${!categoryFilters[category] ? 'opacity-50' : ''}`;
        categoryDiv.dataset.category = category;

        const categoryHeader = document.createElement('h4');
        categoryHeader.className = 'font-semibold mb-2';
        categoryHeader.textContent = getCategoryDisplayName(category);
        categoryDiv.appendChild(categoryHeader);

        components.forEach(component => {
            const label = document.createElement('label');
            label.className = 'flex items-center mb-1 ml-4';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = componentFilters[component] || false;
            checkbox.disabled = !categoryFilters[category];
            checkbox.className = 'mr-2';
            checkbox.addEventListener('change', () => handleComponentChange(component));

            const span = document.createElement('span');
            span.className = 'text-sm';
            span.textContent = component;

            label.appendChild(checkbox);
            label.appendChild(span);
            categoryDiv.appendChild(label);
        });

        componentPanel.appendChild(categoryDiv);
    });

    container.appendChild(categoryPanel);
    container.appendChild(componentPanel);
    filterPanel.appendChild(container);
}

function handleCategoryChange(category) {
    categoryFilters[category] = !categoryFilters[category];

    categoryComponents[category].forEach(component => {
        componentFilters[component] = categoryFilters[category];
    });

    updateMarkersAndTable();
    createFilterPanel(); 
}

function handleComponentChange(component) {
    componentFilters[component] = !componentFilters[component];
    updateMarkersAndTable();
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

function updateMarkersAndTable() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    const filteredFactories = factoriesData.filter(factory => {
        return factory.measurements.some(measurement => {
            const categoryName = measurement.category_name.toLowerCase();
            const categoryMatch = Object.entries(categoryFilters).some(([category, isSelected]) => 
                isSelected && categoryName.includes(getCategoryKeyword(category))
            );

            const componentMatch = componentFilters[measurement.component_name];

            return categoryMatch && componentMatch;
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

    updateDataTable(filteredFactories);
}

function createPieChart(data, container, title) {
    container.innerHTML = '';
    
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height + 60); 
    
    const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleElement.setAttribute('x', centerX);
    titleElement.setAttribute('y', 20);
    titleElement.setAttribute('text-anchor', 'middle');
    titleElement.setAttribute('font-size', '14px');
    titleElement.textContent = title;
    svg.appendChild(titleElement);

    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
    
    const componentValues = new Map();
    data.forEach(measurement => {
        componentValues.set(measurement.component_name, parseFloat(measurement.value));
    });

    const pieData = Array.from(componentValues.entries()).map(([name, value]) => ({
        name,
        value
    }));

    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    const pieGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pieGroup.setAttribute('transform', `translate(${centerX},${centerY})`);

    let startAngle = 0;
    
    pieData.forEach((item, index) => {
        const percentage = item.value / total;
        const angle = percentage * 360;
        const endAngle = startAngle + angle;
        
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        
        const x1 = radius * Math.cos(startRad);
        const y1 = radius * Math.sin(startRad);
        const x2 = radius * Math.cos(endRad);
        const y2 = radius * Math.sin(endRad);
        
        const largeArc = angle > 180 ? 1 : 0;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = [
            `M ${x1} ${y1}`, // move to start
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, // Arc
            `L 0 0`, // Line to center
            'Z' // Close to path
        ].join(' ');
        
        path.setAttribute('d', d);
        path.setAttribute('fill', colors[index % colors.length]);
        
        path.setAttribute('data-name', item.name);
        path.setAttribute('data-value', item.value.toFixed(2));
        
        path.addEventListener('mouseover', function(e) {
            this.style.opacity = '0.8';
            showTooltip(e, this.getAttribute('data-name'), this.getAttribute('data-value'));
        });
        
        path.addEventListener('mouseout', function() {
            this.style.opacity = '1';
            hideTooltip();
        });
        
        pieGroup.appendChild(path);
        
        const legendY = height + 20 + (index * 20);
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', 10);
        rect.setAttribute('y', legendY);
        rect.setAttribute('width', 10);
        rect.setAttribute('height', 10);
        rect.setAttribute('fill', colors[index % colors.length]);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 25);
        text.setAttribute('y', legendY + 9);
        text.setAttribute('font-size', '12px');
        text.textContent = `${item.name}: ${item.value.toFixed(2)}`;
        
        svg.appendChild(rect);
        svg.appendChild(text);
        
        startAngle = endAngle;
    });
    
    svg.appendChild(pieGroup);
    container.appendChild(svg);
}

function showTooltip(event, name, value) {
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px';
        tooltip.style.borderRadius = '3px';
        tooltip.style.fontSize = '12px';
        tooltip.style.pointerEvents = 'none';
        document.body.appendChild(tooltip);
    }
    
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 'px';
    tooltip.style.top = event.pageY + 'px';
    tooltip.innerHTML = `${name}: ${value}`;
}

function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function updateDataTable(factories) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    const headerRow = document.createElement('tr');
    const factoryHeader = document.createElement('th');
    factoryHeader.textContent = 'Назва фабрики';
    headerRow.appendChild(factoryHeader);
    
    Object.entries(categoryFilters).forEach(([category, isSelected]) => {
        if (isSelected) {
            const th = document.createElement('th');
            th.textContent = getCategoryDisplayName(category);
            headerRow.appendChild(th);
        }
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    factories.forEach(factory => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = factory.factory_name;
        row.appendChild(nameCell);
        
        Object.entries(categoryFilters).forEach(([category, isSelected]) => {
            if (isSelected) {
                const cell = document.createElement('td');
                const categoryMeasurements = factory.measurements.filter(m => {
                    const categoryName = m.category_name.toLowerCase();
                    const categoryMatch = categoryName.includes(getCategoryKeyword(category));
                    const componentMatch = componentFilters[m.component_name];
                    return categoryMatch && componentMatch;
                });
                
                if (categoryMeasurements.length > 0) {
                    // Получаем последние измерения для каждого компонента
                    const latestMeasurements = new Map();
                    categoryMeasurements.forEach(measurement => {
                        const currentDate = new Date(measurement.measurement_date);
                        const existingMeasurement = latestMeasurements.get(measurement.component_name);
                        
                        if (!existingMeasurement || 
                            new Date(existingMeasurement.measurement_date) < currentDate) {
                            latestMeasurements.set(measurement.component_name, measurement);
                        }
                    });
                    
                    // Создаем контейнер для диаграммы
                    const chartContainer = document.createElement('div');
                    chartContainer.style.width = '250px';
                    chartContainer.style.height = '300px';
                    cell.appendChild(chartContainer);
                    
                    // Создаем круговую диаграмму
                    createPieChart(
                        Array.from(latestMeasurements.values()),
                        chartContainer,
                        getCategoryDisplayName(category)
                    );
                } else {
                    cell.textContent = 'Немає даних';
                }
                
                row.appendChild(cell);
            }
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    
    // Добавляем стили для таблицы
    const style = document.createElement('style');
    style.textContent = `
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .chart-container {
            margin: 10px 0;
        }
    `;
    document.head.appendChild(style);
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
        initComponentFilters();
        createFilterPanel();
        updateMarkersAndTable();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

(async function loadGoogleMaps() {
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&libraries=&v=beta";
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
})();