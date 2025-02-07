document.addEventListener('DOMContentLoaded', async () => {
    const factoryListElement = document.getElementById('factoryList');

    try {
        const response = await fetch('/api/web-eco/all-factories');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const factories = await response.json();
        
        if (factories.length === 0) {
            factoryListElement.innerHTML = '<p>Фабрики не найдены</p>';
            return;
        }

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
        factoryListElement.innerHTML = `
            <div class="error">
                Произошла ошибка при загрузке данных: ${error.message}
            </div>
        `;
    }
});