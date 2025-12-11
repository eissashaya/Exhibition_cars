// ملف دوال إدارة المبيعات

// تحديث إحصائيات المبيعات
function updateSalesStats() {
    if (document.getElementById('salesTotal')) {
        document.getElementById('salesTotal').textContent = sales.length;
    }
    
    if (document.getElementById('revenueTotal')) {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
        document.getElementById('revenueTotal').textContent = totalRevenue.toLocaleString() + ' ر.س';
    }
    
    if (document.getElementById('avgSale')) {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
        const avgSale = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0;
        document.getElementById('avgSale').textContent = avgSale.toLocaleString() + ' ر.س';
    }
    
    if (document.getElementById('monthlySales')) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        }).length;
        document.getElementById('monthlySales').textContent = monthlySales;
    }
}

// ملء قائمة السيارات المتاحة للبيع
function populateCarDropdown() {
    const select = document.getElementById('saleCar');
    if (!select) return;
    
    select.innerHTML = '<option value="">اختر سيارة</option>';
    cars.filter(c => c.status === 'متاحة').forEach(car => {
        const option = document.createElement('option');
        option.value = car.id;
        option.textContent = `${car.model} - ${car.year} (${car.price.toLocaleString()} ر.س)`;
        select.appendChild(option);
    });
    
    // التحقق مما إذا كان هناك معلمة carId في الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('carId');
    if (carId) {
        select.value = carId;
    }
}

// تحديث جدول المبيعات
function updateSalesTable() {
    const tbody = document.querySelector('#salesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // ترتيب المبيعات من الأحدث إلى الأقدم
    const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedSales.forEach(sale => {
        const row = `
            <tr>
                <td><strong>${formatDate(sale.date)}</strong></td>
                <td>${sale.model}</td>
                <td>${sale.customer}<br><small>${sale.customerPhone || ''}</small></td>
                <td><strong>${sale.amount.toLocaleString()} ر.س</strong></td>
                <td>${sale.paymentMethod}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm" onclick="editSale(${sale.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSale(${sale.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    updateSalesStats();
}

// تسجيل عملية بيع
function handleSale() {
    const carId = parseInt(document.getElementById('saleCar').value);
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const saleDate = document.getElementById('saleDate').value;
    const saleNotes = document.getElementById('saleNotes').value;
    const saleCommission = parseFloat(document.getElementById('saleCommission').value) || 0;

    if (!carId || !customerName || !paymentMethod || !saleDate) {
        showMessage('saleMessage', 'جميع الحقول المطلوبة', 'error');
        return;
    }

    const car = cars.find(c => c.id === carId);
    
    if (!car) {
        showMessage('saleMessage', 'السيارة غير موجودة', 'error');
        return;
    }

    if (car.status !== 'متاحة') {
        showMessage('saleMessage', 'السيارة غير متاحة للبيع', 'error');
        return;
    }

    const saleRecord = {
        id: generateId(),
        date: saleDate,
        carId: car.id,
        model: car.model,
        customer: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        customerAddress: customerAddress,
        amount: car.price,
        paymentMethod: paymentMethod,
        commission: saleCommission,
        notes: saleNotes
    };

    // تحديث حالة السيارة إلى "مباعة"
    car.status = 'مباعة';
    
    // إضافة عملية البيع
    sales.push(saleRecord);
    
    // حفظ التحديثات في localStorage
    localStorage.setItem('cars', JSON.stringify(cars));
    localStorage.setItem('sales', JSON.stringify(sales));
    
    showMessage('saleMessage', 'تم تسجيل البيع بنجاح', 'success');
    
    // تحديث الواجهة
    updateSalesTable();
    populateCarDropdown();
    updateGeneralStats();
    
    // تفريغ النموذج
    clearSaleForm();
}

// تعديل عملية بيع
function editSale(saleId) {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const newCustomerName = prompt("أدخل اسم العميل الجديد:", sale.customer);
    if (!newCustomerName) return;
    
    const newCustomerPhone = prompt("أدخل هاتف العميل الجديد:", sale.customerPhone || '');
    const newPaymentMethod = prompt("أدخل طريقة الدفع الجديدة:", sale.paymentMethod);
    const newSaleDate = prompt("أدخل تاريخ البيع الجديد (YYYY-MM-DD):", sale.date);

    if (newCustomerName && newPaymentMethod && newSaleDate) {
        sale.customer = newCustomerName;
        sale.customerPhone = newCustomerPhone;
        sale.paymentMethod = newPaymentMethod;
        sale.date = newSaleDate;

        localStorage.setItem('sales', JSON.stringify(sales));
        showMessage('saleMessage', 'تم تعديل البيع بنجاح', 'success');
        updateSalesTable();
        updateGeneralStats();
    } else {
        showMessage('saleMessage', 'تم إلغاء التعديل', 'error');
    }
}

// حذف عملية بيع
function deleteSale(saleId) {
    if (!confirm("هل أنت متأكد من حذف عملية البيع هذه؟")) return;

    const saleIndex = sales.findIndex(s => s.id === saleId);
    if (saleIndex === -1) return;

    // استعادة حالة السيارة إلى "متاحة"
    const car = cars.find(c => c.id === sales[saleIndex].carId);
    if (car) {
        car.status = 'متاحة';
    }

    // حذف عملية البيع
    sales.splice(saleIndex, 1);
    
    // حفظ التحديثات
    localStorage.setItem('cars', JSON.stringify(cars));
    localStorage.setItem('sales', JSON.stringify(sales));
    
    showMessage('saleMessage', 'تم حذف البيع بنجاح', 'success');
    updateSalesTable();
    populateCarDropdown();
    updateGeneralStats();
}

// فلترة المبيعات
function filterSales() {
    const searchText = document.getElementById('saleSearch').value.toLowerCase();
    const paymentFilter = document.getElementById('paymentFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;
    
    const filteredSales = sales.filter(sale => {
        const matchesSearch = !searchText || 
            sale.customer.toLowerCase().includes(searchText) ||
            sale.model.toLowerCase().includes(searchText);
        
        const matchesPayment = paymentFilter === 'الكل' || sale.paymentMethod === paymentFilter;
        
        let matchesMonth = true;
        if (monthFilter) {
            const saleDate = new Date(sale.date);
            const filterDate = new Date(monthFilter);
            matchesMonth = saleDate.getMonth() === filterDate.getMonth() && 
                          saleDate.getFullYear() === filterDate.getFullYear();
        }
        
        return matchesSearch && matchesPayment && matchesMonth;
    });
    
    // تحديث الجدول بالمبيعات المفلترة
    const tbody = document.querySelector('#salesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredSales.forEach(sale => {
        const row = `
            <tr>
                <td><strong>${formatDate(sale.date)}</strong></td>
                <td>${sale.model}</td>
                <td>${sale.customer}<br><small>${sale.customerPhone || ''}</small></td>
                <td><strong>${sale.amount.toLocaleString()} ر.س</strong></td>
                <td>${sale.paymentMethod}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm" onclick="editSale(${sale.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSale(${sale.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// إعادة تعيين فلاتر المبيعات
function resetSaleFilters() {
    document.getElementById('saleSearch').value = '';
    document.getElementById('paymentFilter').value = 'الكل';
    document.getElementById('monthFilter').value = '';
    filterSales();
}

// مسح نموذج البيع
function clearSaleForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('saleNotes').value = '';
    document.getElementById('saleCommission').value = '5';
    
    // الحفاظ على السيارة المحددة إذا كانت موجودة
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('carId');
    if (!carId) {
        document.getElementById('saleCar').value = '';
    }
}

// تصدير بيانات المبيعات
function exportSales() {
    exportToExcel(sales, 'مبيعات_المعرض');
}

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // ملء قائمة السيارات المتاحة
    populateCarDropdown();
    
    // تحديث جدول المبيعات
    updateSalesTable();
    
    // تهيئة البحث
    const saleSearch = document.getElementById('saleSearch');
    if (saleSearch) {
        saleSearch.addEventListener('input', filterSales);
    }
    
    // إضافة معالجة لزر تسجيل البيع
    const saleBtn = document.querySelector('button[onclick="handleSale()"]');
    if (saleBtn) {
        saleBtn.addEventListener('click', handleSale);
    }
});