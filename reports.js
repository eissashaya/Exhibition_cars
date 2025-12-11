// ملف دوال التقارير والإحصائيات

// تبديل تبويبات التقارير
function switchReportTab(tabName) {
    // إخفاء جميع المحتويات
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // إزالة النشاط من جميع التبويبات
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إظهار المحتوى المحدد
    document.getElementById(tabName).classList.add('active');
    
    // إضافة النشاط إلى التبويب المحدد
    event.target.classList.add('active');
}

// الحصول على النطاق الزمني
function getDateRange(period) {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch(period) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(today.getMonth() - 3);
            break;
        case 'year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
    }
    
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
}

// تبديل خيارات الفترة المخصصة
function handleSalesPeriodChange() {
    const period = document.getElementById('salesPeriod').value;
    const customDateGroup = document.getElementById('salesCustomDateGroup');
    const customDateGroup2 = document.getElementById('salesCustomDateGroup2');
    
    if (period === 'custom') {
        customDateGroup.style.display = 'block';
        customDateGroup2.style.display = 'block';
    } else {
        customDateGroup.style.display = 'none';
        customDateGroup2.style.display = 'none';
        
        // تعيين التواريخ التلقائية
        const dates = getDateRange(period);
        if (document.getElementById('salesStartDate')) {
            document.getElementById('salesStartDate').value = dates.startDate;
            document.getElementById('salesEndDate').value = dates.endDate;
        }
    }
}

// توليد تقرير المبيعات
function generateSalesReport() {
    const period = document.getElementById('salesPeriod').value;
    const groupBy = document.getElementById('salesGroupBy').value;
    
    let startDate, endDate;
    
    if (period === 'custom') {
        startDate = document.getElementById('salesStartDate').value;
        endDate = document.getElementById('salesEndDate').value;
    } else {
        const dates = getDateRange(period);
        startDate = dates.startDate;
        endDate = dates.endDate;
    }
    
    // فلترة المبيعات حسب الفترة الزمنية
    const filteredSales = sales.filter(s => {
        const saleDate = new Date(s.date);
        return (!startDate || saleDate >= new Date(startDate)) && 
               (!endDate || saleDate <= new Date(endDate));
    });
    
    if (filteredSales.length === 0) {
        document.getElementById('salesReportOutput').innerHTML = 
            '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle"></i> لا توجد بيانات مبيعات للفترة المحددة</div>';
        document.getElementById('salesCharts').innerHTML = '';
        return;
    }
    
    let reportData = [];
    let columns = [];
    let title = `تقرير المبيعات - ${period === 'custom' ? 'فترة مخصصة' : period}`;
    
    // تجميع البيانات حسب المعيار المحدد
    if (groupBy === 'day' || groupBy === 'week' || groupBy === 'month') {
        const groupedData = {};
        
        filteredSales.forEach(sale => {
            const date = new Date(sale.date);
            let key;
            
            if (groupBy === 'day') {
                key = date.toISOString().split('T')[0];
            } else if (groupBy === 'week') {
                const weekNumber = Math.ceil(date.getDate() / 7);
                key = `أسبوع ${weekNumber} - ${date.getMonth() + 1}/${date.getFullYear()}`;
            } else if (groupBy === 'month') {
                key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            }
            
            if (!groupedData[key]) {
                groupedData[key] = {
                    period: key,
                    total: 0,
                    count: 0,
                    avg: 0
                };
            }
            
            groupedData[key].total += sale.amount;
            groupedData[key].count++;
        });
        
        // تحويل إلى مصفوفة وحساب المتوسط
        reportData = Object.values(groupedData).map(item => ({
            ...item,
            avg: Math.round(item.total / item.count)
        }));
        
        columns = ['الفترة', 'عدد المبيعات', 'الإجمالي', 'المتوسط'];
        
    } else if (groupBy === 'model') {
        const groupedData = {};
        
        filteredSales.forEach(sale => {
            if (!groupedData[sale.model]) {
                groupedData[sale.model] = {
                    model: sale.model,
                    total: 0,
                    count: 0
                };
            }
            
            groupedData[sale.model].total += sale.amount;
            groupedData[sale.model].count++;
        });
        
        reportData = Object.values(groupedData);
        columns = ['الموديل', 'عدد المبيعات', 'الإجمالي'];
        
    } else if (groupBy === 'payment') {
        const groupedData = {};
        
        filteredSales.forEach(sale => {
            if (!groupedData[sale.paymentMethod]) {
                groupedData[sale.paymentMethod] = {
                    method: sale.paymentMethod,
                    total: 0,
                    count: 0
                };
            }
            
            groupedData[sale.paymentMethod].total += sale.amount;
            groupedData[sale.paymentMethod].count++;
        });
        
        reportData = Object.values(groupedData);
        columns = ['طريقة الدفع', 'عدد المبيعات', 'الإجمالي'];
    }
    
    // عرض التقرير
    renderReport('salesReportOutput', reportData, columns, title);
    
    // عرض المخططات البيانية
    renderSalesCharts(filteredSales, groupBy);
}

// عرض التقرير في جدول
function renderReport(containerId, data, columns, title) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `
        <div class="section" style="margin-top: 1rem;">
            <h3><i class="fas fa-chart-bar"></i> ${title}</h3>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
    `;
    
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    
    html += `</tr></thead><tbody>`;
    
    data.forEach(item => {
        html += `<tr>`;
        columns.forEach(col => {
            let value = item[col === 'الفترة' ? 'period' : 
                           col === 'الموديل' ? 'model' : 
                           col === 'طريقة الدفع' ? 'method' : 
                           col === 'عدد المبيعات' ? 'count' : 
                           col === 'الإجمالي' ? 'total' : 
                           col === 'المتوسط' ? 'avg' : ''];
            
            if (col === 'الإجمالي' || col === 'المتوسط') {
                value = `${value.toLocaleString()} ر.س`;
            }
            
            html += `<td>${value}</td>`;
        });
        html += `</tr>`;
    });
    
    html += `</tbody></table></div></div>`;
    
    container.innerHTML = html;
}

// عرض مخططات المبيعات
function renderSalesCharts(salesData, groupBy) {
    const container = document.getElementById('salesCharts');
    if (!container) return;
    
    let html = `<div class="section"><h3><i class="fas fa-chart-pie"></i> مخططات بيانية</h3>`;
    
    if (groupBy === 'model' || groupBy === 'payment') {
        // مخطط دائري
        const groupedData = {};
        salesData.forEach(sale => {
            const key = groupBy === 'model' ? sale.model : sale.paymentMethod;
            if (!groupedData[key]) {
                groupedData[key] = 0;
            }
            groupedData[key] += sale.amount;
        });
        
        const total = Object.values(groupedData).reduce((sum, val) => sum + val, 0);
        
        html += `<div style="display: flex; flex-wrap: wrap; gap: 2rem; margin-top: 1rem;">`;
        
        Object.entries(groupedData).forEach(([key, value], index) => {
            const percentage = Math.round((value / total) * 100);
            const colors = ['#2A5CAA', '#FF6B35', '#28A745', '#FFC107', '#DC3545', '#17A2B8'];
            
            html += `
                <div style="flex: 1; min-width: 200px;">
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <div style="width: 20px; height: 20px; background: ${colors[index % colors.length]}; margin-left: 10px; border-radius: 4px;"></div>
                        <div><strong>${key}</strong></div>
                    </div>
                    <div style="height: 10px; background: #E9ECEF; border-radius: 5px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: ${colors[index % colors.length]};"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span>${percentage}%</span>
                        <span>${value.toLocaleString()} ر.س</span>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    } else {
        // مخطط عمودي
        const groupedData = {};
        salesData.forEach(sale => {
            const date = new Date(sale.date);
            let key;
            
            if (groupBy === 'day') {
                key = date.toLocaleDateString('ar-EG');
            } else if (groupBy === 'week') {
                const weekNumber = Math.ceil(date.getDate() / 7);
                key = `أسبوع ${weekNumber}`;
            } else if (groupBy === 'month') {
                key = date.toLocaleDateString('ar-EG', { month: 'long' });
            }
            
            if (!groupedData[key]) {
                groupedData[key] = 0;
            }
            groupedData[key] += sale.amount;
        });
        
        const maxValue = Math.max(...Object.values(groupedData));
        const keys = Object.keys(groupedData);
        
        html += `
            <div style="display: flex; align-items: flex-end; height: 300px; gap: 20px; margin-top: 2rem; padding: 1rem; border: 1px solid #E9ECEF; border-radius: 6px;">
        `;
        
        keys.forEach((key, index) => {
            const height = (groupedData[key] / maxValue) * 250;
            const colors = ['#2A5CAA', '#4A7EC9', '#6C9EE3', '#8FBEFD'];
            
            html += `
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="width: 40px; height: ${height}px; background: ${colors[index % colors.length]}; border-radius: 5px 5px 0 0;"></div>
                    <div style="margin-top: 10px; font-size: 0.8rem; text-align: center;">${key}</div>
                    <div style="margin-top: 5px; font-size: 0.7rem; color: #6C757D;">${groupedData[key].toLocaleString()} ر.س</div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    html += `</div>`;
    container.innerHTML = html;
}

// تقارير سريعة
function generateDailyReport() {
    document.getElementById('salesPeriod').value = 'today';
    handleSalesPeriodChange();
    generateSalesReport();
    switchReportTab('salesReport');
}

function generateWeeklyReport() {
    document.getElementById('salesPeriod').value = 'week';
    handleSalesPeriodChange();
    generateSalesReport();
    switchReportTab('salesReport');
}

function generateTopModelsReport() {
    document.getElementById('salesPeriod').value = 'year';
    document.getElementById('salesGroupBy').value = 'model';
    handleSalesPeriodChange();
    generateSalesReport();
    switchReportTab('salesReport');
}

function generateInventoryStatus() {
    switchReportTab('inventoryReport');
    generateInventoryReport();
}

// دوال إضافية للتقارير الأخرى (يمكن توسيعها حسب الحاجة)

function generateInventoryReport() {
    const groupBy = document.getElementById('inventoryGroupBy').value;
    const sortBy = document.getElementById('inventorySortBy').value;
    
    let reportData = [...cars];
    
    // ترتيب البيانات
    reportData.sort((a, b) => {
        if (sortBy === 'price') return b.price - a.price;
        if (sortBy === 'year') return b.year - a.year;
        if (sortBy === 'mileage') return b.mileage - a.mileage;
        if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
    });
    
    const columns = ['الموديل', 'النوع', 'السنة', 'السعر', 'المسافة', 'الحالة', 'اللون'];
    const title = 'تقرير المخزون - جميع السيارات';
    
    renderReport('inventoryReportOutput', reportData, columns, title);
}

// دوال تصدير التقارير
function exportSalesReport() {
    const period = document.getElementById('salesPeriod').value;
    const filename = `تقرير_المبيعات_${period}_${new Date().toISOString().slice(0,10)}`;
    
    // جمع البيانات الحالية
    const container = document.getElementById('salesReportOutput');
    const table = container.querySelector('table');
    
    if (!table) {
        showMessage('salesMessage', 'لا توجد بيانات للتصدير', 'warning');
        return;
    }
    
    // هنا يمكن إضافة منطق تصدير أكثر تطوراً
    exportToExcel(sales, filename);
}

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحديث إحصائيات التقارير
    updateReportStats();
    
    // تهيئة خيارات الفترة الزمنية
    handleSalesPeriodChange();
    
    // توليد تقرير افتراضي
    generateSalesReport();
});

// تحديث إحصائيات التقارير
function updateReportStats() {
    // معدل البيع اليومي
    if (document.getElementById('dailySalesRate')) {
        const today = new Date().toISOString().split('T')[0];
        const todaySales = sales.filter(s => s.date === today).length;
        document.getElementById('dailySalesRate').textContent = todaySales;
    }
    
    // نسبة البيع
    if (document.getElementById('salePercentage')) {
        const totalCars = cars.length;
        const soldCars = cars.filter(c => c.status === 'مباعة').length;
        const percentage = totalCars > 0 ? Math.round((soldCars / totalCars) * 100) : 0;
        document.getElementById('salePercentage').textContent = `${percentage}%`;
    }
    
    // أكثر موديل مبيعاً
    if (document.getElementById('topSalesModel')) {
        const modelCounts = {};
        sales.forEach(sale => {
            modelCounts[sale.model] = (modelCounts[sale.model] || 0) + 1;
        });
        
        let topModel = '-';
        let maxCount = 0;
        
        Object.entries(modelCounts).forEach(([model, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topModel = model;
            }
        });
        
        document.getElementById('topSalesModel').textContent = topModel;
    }
    
    // أفضل عميل
    if (document.getElementById('topCustomer')) {
        const customerSpending = {};
        sales.forEach(sale => {
            customerSpending[sale.customer] = (customerSpending[sale.customer] || 0) + sale.amount;
        });
        
        let topCustomer = '-';
        let maxSpending = 0;
        
        Object.entries(customerSpending).forEach(([customer, spending]) => {
            if (spending > maxSpending) {
                maxSpending = spending;
                topCustomer = customer;
            }
        });
        
        document.getElementById('topCustomer').textContent = topCustomer;
    }
}