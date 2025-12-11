// ملف دوال إدارة السيارات

let currentCarId = null; // لتتبع السيارة التي يتم تعديلها

// تحديث إحصائيات السيارات
function updateCarsStats() {
    if (document.getElementById('carsTotal')) {
        document.getElementById('carsTotal').textContent = cars.length;
    }
    
    if (document.getElementById('carsAvailable')) {
        document.getElementById('carsAvailable').textContent = cars.filter(c => c.status === 'متاحة').length;
    }
    
    if (document.getElementById('inventoryValue')) {
        const totalValue = cars.reduce((sum, car) => sum + car.price, 0);
        document.getElementById('inventoryValue').textContent = totalValue.toLocaleString() + ' ر.س';
    }
    
    if (document.getElementById('carsMaintenance')) {
        document.getElementById('carsMaintenance').textContent = cars.filter(c => c.status === 'قيد الصيانة').length;
    }
}

// تحديث قائمة السيارات
function updateCarList() {
    const tbody = document.querySelector('#carsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    cars.forEach(car => {
        const statusClass = {
            'متاحة': 'available',
            'مباعة': 'sold',
            'قيد الصيانة': 'pending',
            'مؤجلة': 'pending'
        }[car.status];
        
        const row = `
            <tr>
                <td><strong>${car.model}</strong><br><small>${car.brand || ''} - ${car.color}</small></td>
                <td>${car.type}</td>
                <td>${car.year}</td>
                <td><strong>${car.price.toLocaleString()} ر.س</strong></td>
                <td><span class="status ${statusClass}">${car.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm" onclick="editCar(${car.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCar(${car.id})"><i class="fas fa-trash"></i></button>
                        ${car.status === 'متاحة' ? `<button class="btn btn-sm btn-success" onclick="quickSale(${car.id})"><i class="fas fa-cash-register"></i></button>` : ''}
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    updateCarsStats();
}

// إضافة سيارة جديدة
function addCar(carData) {
    carData.id = generateId();
    carData.createdAt = new Date().toISOString().split('T')[0];
    cars.push(carData);
    localStorage.setItem('cars', JSON.stringify(cars));
    showMessage('carMessage', 'تمت إضافة السيارة بنجاح', 'success');
    updateCarList();
    updateGeneralStats();
}

// تعديل سيارة
function editCar(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    
    // ملء النموذج ببيانات السيارة
    document.getElementById('carModel').value = car.model;
    document.getElementById('carType').value = car.type;
    document.getElementById('carBrand').value = car.brand || '';
    document.getElementById('carYear').value = car.year;
    document.getElementById('carPrice').value = car.price;
    document.getElementById('carMileage').value = car.mileage;
    document.getElementById('carColor').value = car.color;
    document.getElementById('carStatus').value = car.status;
    document.getElementById('carDescription').value = car.description || '';
    
    currentCarId = carId;
    document.querySelector('#carForm button[type="submit"]').innerHTML = '<i class="fas fa-edit"></i> تحديث السيارة';
    
    // التمرير إلى نموذج السيارة
    document.getElementById('carForm').scrollIntoView({ behavior: 'smooth' });
    showMessage('carMessage', 'يمكنك الآن تعديل بيانات السيارة', 'warning');
}

// تحديث سيارة
function updateCar(carId, carData) {
    const index = cars.findIndex(c => c.id === carId);
    if (index !== -1) {
        // الحفاظ على بعض البيانات القديمة
        carData.id = carId;
        carData.createdAt = cars[index].createdAt;
        
        cars[index] = carData;
        localStorage.setItem('cars', JSON.stringify(cars));
        showMessage('carMessage', 'تم تعديل السيارة بنجاح', 'success');
        currentCarId = null;
        updateCarList();
        updateGeneralStats();
    }
}

// حذف سيارة
function deleteCar(carId) {
    if (!confirm("هل أنت متأكد من حذف هذه السيارة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    
    const carIndex = cars.findIndex(c => c.id === carId);
    if (carIndex === -1) return;
    
    // حذف المبيعات المرتبطة بهذه السيارة
    sales = sales.filter(s => s.carId !== carId);
    localStorage.setItem('sales', JSON.stringify(sales));
    
    // حذف السيارة
    cars.splice(carIndex, 1);
    localStorage.setItem('cars', JSON.stringify(cars));
    
    showMessage('carMessage', 'تم حذف السيارة بنجاح', 'success');
    updateCarList();
    updateGeneralStats();
}

// بيع سريع
function quickSale(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    
    // الانتقال إلى صفحة المبيعات
    window.location.href = `sales.html?carId=${carId}`;
}

// فلترة السيارات
function filterCars() {
    const searchText = document.getElementById('carSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    const filteredCars = cars.filter(car => {
        const matchesSearch = !searchText || 
            car.model.toLowerCase().includes(searchText) ||
            car.color.toLowerCase().includes(searchText) ||
            car.type.toLowerCase().includes(searchText) ||
            (car.brand && car.brand.toLowerCase().includes(searchText));
        
        const matchesStatus = statusFilter === 'الكل' || car.status === statusFilter;
        const matchesType = typeFilter === 'الكل' || car.type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });
    
    // تحديث الجدول بالسيارات المفلترة
    const tbody = document.querySelector('#carsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredCars.forEach(car => {
        const statusClass = {
            'متاحة': 'available',
            'مباعة': 'sold',
            'قيد الصيانة': 'pending',
            'مؤجلة': 'pending'
        }[car.status];
        
        const row = `
            <tr>
                <td><strong>${car.model}</strong><br><small>${car.brand || ''} - ${car.color}</small></td>
                <td>${car.type}</td>
                <td>${car.year}</td>
                <td><strong>${car.price.toLocaleString()} ر.س</strong></td>
                <td><span class="status ${statusClass}">${car.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm" onclick="editCar(${car.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCar(${car.id})"><i class="fas fa-trash"></i></button>
                        ${car.status === 'متاحة' ? `<button class="btn btn-sm btn-success" onclick="quickSale(${car.id})"><i class="fas fa-cash-register"></i></button>` : ''}
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// إعادة تعيين الفلاتر
function resetFilters() {
    document.getElementById('carSearch').value = '';
    document.getElementById('statusFilter').value = 'الكل';
    document.getElementById('typeFilter').value = 'الكل';
    filterCars();
}

// مسح نموذج السيارة
function clearCarForm() {
    document.getElementById('carForm').reset();
    currentCarId = null;
    document.querySelector('#carForm button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> حفظ السيارة';
    showMessage('carMessage', 'تم مسح النموذج', 'warning');
}

// تصدير بيانات السيارات
function exportCars() {
    exportToExcel(cars, 'سيارات_المعرض');
}

// معالجة تقديم نموذج السيارة
document.addEventListener('DOMContentLoaded', function() {
    const carForm = document.getElementById('carForm');
    if (!carForm) return;
    
    carForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const carData = {
            model: document.getElementById('carModel').value,
            type: document.getElementById('carType').value,
            brand: document.getElementById('carBrand').value,
            year: document.getElementById('carYear').value,
            price: parseFloat(document.getElementById('carPrice').value),
            mileage: parseInt(document.getElementById('carMileage').value),
            color: document.getElementById('carColor').value,
            status: document.getElementById('carStatus').value,
            description: document.getElementById('carDescription').value
        };
        
        if (currentCarId) {
            // تعديل سيارة موجودة
            updateCar(currentCarId, carData);
            carForm.reset();
            currentCarId = null;
            document.querySelector('#carForm button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> حفظ السيارة';
        } else {
            // إضافة سيارة جديدة
            addCar(carData);
            carForm.reset();
        }
    });
    
    // تهيئة البحث
    const carSearch = document.getElementById('carSearch');
    if (carSearch) {
        carSearch.addEventListener('input', filterCars);
    }
    
    // تحديث قائمة السيارات
    updateCarList();
});