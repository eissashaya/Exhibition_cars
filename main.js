// ملف الجافاسكريبت الرئيسي - الوظائف المشتركة بين جميع الصفحات

// تخزين البيانات
let cars = JSON.parse(localStorage.getItem('cars')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];

// بيانات أولية إذا لم تكن هناك بيانات
function initializeSampleData() {
    if (cars.length === 0) {
        cars = [
            {
                id: 1,
                model: "تويوتا كامري",
                brand: "تويوتا",
                type: "سيدان",
                year: 2022,
                price: 120000,
                mileage: 15000,
                color: "أبيض",
                status: "متاحة",
                description: "سيارة ممتازة بحالة جيدة",
                createdAt: "2023-05-15"
            },
            {
                id: 2,
                model: "نيسان باترول",
                brand: "نيسان",
                type: "SUV",
                year: 2021,
                price: 250000,
                mileage: 35000,
                color: "أسود",
                status: "مباعة",
                description: "دفعة كاملة - مكفولة من الوكالة",
                createdAt: "2023-04-10"
            },
            {
                id: 3,
                model: "هيونداي النترا",
                brand: "هيونداي",
                type: "سيدان",
                year: 2023,
                price: 85000,
                mileage: 5000,
                color: "رمادي",
                status: "متاحة",
                description: "موديل حديث جدا",
                createdAt: "2023-06-05"
            },
            {
                id: 4,
                model: "شفروليه تاهو",
                brand: "شفروليه",
                type: "SUV",
                year: 2020,
                price: 180000,
                mileage: 60000,
                color: "أحمر",
                status: "قيد الصيانة",
                description: "تحتاج لصيانة دورية",
                createdAt: "2023-03-22"
            },
            {
                id: 5,
                model: "مرسيدس C200",
                brand: "مرسيدس",
                type: "سيدان",
                year: 2021,
                price: 220000,
                mileage: 25000,
                color: "فضي",
                status: "متاحة",
                description: "فاخرة - موديل أوروبي",
                createdAt: "2023-06-10"
            }
        ];
        localStorage.setItem('cars', JSON.stringify(cars));
    }

    if (sales.length === 0 && cars.some(c => c.status === "مباعة")) {
        const soldCars = cars.filter(c => c.status === "مباعة");
        sales = soldCars.map(car => ({
            id: Date.now() + Math.floor(Math.random() * 1000),
            date: "2023-06-15",
            carId: car.id,
            model: car.model,
            customer: "أحمد محمد",
            customerPhone: "0501234567",
            customerEmail: "ahmed@example.com",
            amount: car.price,
            paymentMethod: "نقدي",
            commission: 5,
            notes: "بيع نقدي"
        }));
        localStorage.setItem('sales', JSON.stringify(sales));
    }
}

// عرض الرسائل
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const icon = type === 'success' ? 'check-circle' : 
                type === 'error' ? 'exclamation-circle' : 
                type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    element.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    element.className = `alert alert-${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// تحديث الإحصائيات العامة
function updateGeneralStats() {
    // تحديث إحصائيات لوحة التحكم
    if (document.getElementById('totalCars')) {
        document.getElementById('totalCars').textContent = cars.length;
    }
    
    if (document.getElementById('soldCars')) {
        document.getElementById('soldCars').textContent = cars.filter(c => c.status === 'مباعة').length;
    }
    
    if (document.getElementById('totalSales')) {
        const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
        document.getElementById('totalSales').textContent = totalSales.toLocaleString() + ' ر.س';
    }
    
    if (document.getElementById('avgPrice')) {
        const totalPrice = cars.reduce((sum, car) => sum + car.price, 0);
        const avgPrice = cars.length > 0 ? Math.round(totalPrice / cars.length) : 0;
        document.getElementById('avgPrice').textContent = avgPrice.toLocaleString() + ' ر.س';
    }
    
    // تحديث إحصائيات الترحيب
    if (document.getElementById('welcomeStats')) {
        document.getElementById('welcomeStats').textContent = `${cars.length} سيارة | ${sales.length} عملية بيع`;
    }
}

// تحويل التاريخ للتنسيق العربي
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
}

// توليد معرف فريد
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// تصدير البيانات إلى ملف Excel
function exportToExcel(data, filename) {
    if (!data || data.length === 0) {
        showMessage('exportMessage', 'لا توجد بيانات للتصدير', 'warning');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // رأس الجدول
    const headers = Object.keys(data[0]);
    csvContent += headers.join(",") + "\n";
    
    // البيانات
    data.forEach(item => {
        const row = headers.map(header => {
            const value = item[header];
            return typeof value === 'string' ? `"${value}"` : value;
        });
        csvContent += row.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// تحقق من تفاصيل الصفحة الحالية
function checkCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    return currentPage;
}

// تهيئة تاريخ اليوم في حقول التاريخ
function initializeTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة البيانات الأولية
    initializeSampleData();
    
    // تحديث الإحصائيات العامة
    updateGeneralStats();
    
    // تهيئة تواريخ اليوم
    initializeTodayDate();
    
    // تحديد الصفحة النشطة في القائمة
    const currentPage = checkCurrentPage();
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // إضافة تأثيرات تفاعلية
    const cards = document.querySelectorAll('.stat-card, .quick-action-card, .car-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});