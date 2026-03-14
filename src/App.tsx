
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Transaction, SKUCode, TransactionItem, EtapaProduccion, AppConfig, TransactionType, AccountType } from './types';
import { CONCEPTOS, ESTADOS, ETAPAS_PRODUCCION, MEDIOS_ENVIO } from './constants';
import { LayoutDashboard, Plus, ShoppingCart, Package, TrendingUp, TrendingDown, Edit3, Database, Search, Download, MessageSquare, ChevronLeft, ChevronRight, Truck, Check, MapPin } from './components/Icons';
import AIChat from './components/AIChat';
import MercadoPagoImporter from './components/MercadoPagoImporter';
import { useLaserBeam } from './hooks/useLaserBeam';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  useGrouping: true,
});

const formatCurrency = (amount: number) => {
  const rounded = Math.round((amount + 0.000001) * 100) / 100;
  return currencyFormatter.format(rounded);
};

const ACCOUNT_IMPUTABLE_MAP: Record<string, string[]> = {
  'Ventas': ['Venta Fábrica', 'Ventas LaserBeam'],
  'Otros Ingresos': ['Otros Ingresos'],
  'Costos Operativos': ['Materia Prima LaserBeam', 'Materia Prima Fábrica', 'Sueldos', 'Publicidad', 'Consumibles', 'Logística', 'Infra Estructura'],
  'Costos No Operativos': ['Reserva Taller', 'Viáticos', 'Ajuste Cuentas', 'Otros Egresos'],
  'Servicios': ['Servicios/Suscrip.', 'Tienda Online'],
  'Impuestos': ['Monotributo Julian', 'Monotributo Carla', 'Monotributo Edith', 'Impuestos Municipales']
};

const SERVICIOS_SUPPLIERS = [
  'ChatGPT', 'Google Workspace', 'Creative Fabrica', 'Canva', 'Claro Telefonia',
  'Movistar Telefonia', 'Internet', 'Edenor', 'Licencias', 'ARCA', 'TiendaNube',
  'Facebook', 'Mercado Libre', 'Varios', 'Trello', 'Correo/Envios', 'Limpieza'
];

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
    <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
    <span className="font-bold text-sm">{label}</span>
  </button>
);

const ConfigTab: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
    {label}
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ventas' | 'stock' | 'add' | 'pnl' | 'config' | 'produccion' | 'logistica'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { 
    transactions, products, currentStocks, stats, config, isSyncing, 
    addTransaction, updateTransaction, deleteTransaction, updateTransactionEtapa, reorderTransactions, updateBaseStock, addProduct, setConfig, updateConfigList, fetchFromCloud, downloadBackup,
    importTransactions, clearTransactions
  } = useLaserBeam();

  const [editingStock, setEditingStock] = useState<SKUCode | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  const [logisticsTx, setLogisticsTx] = useState<Transaction | null>(null);
  const [isEditingLogistics, setIsEditingLogistics] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-900 bg-slate-50">
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden fixed top-4 right-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg">
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <nav className={`fixed inset-y-0 left-0 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-40 w-72 bg-slate-900 text-white p-6 flex flex-col gap-8`}>
        <div className="flex flex-col gap-1">
          <div className="bg-white p-5 rounded-[1.5rem] shadow-inner mb-2 flex flex-col items-start laser-glow">
            <div className="flex flex-col leading-none w-full">
              <span className="text-[#1a365d] text-2xl font-light tracking-tight">LASER</span>
              <span className="text-[#334155] text-4xl font-black tracking-tighter -mt-1">BEAM</span>
              <div className="w-full h-[3px] bg-gradient-to-r from-indigo-500 via-emerald-500 to-transparent my-1.5 opacity-60"></div>
              <span className="text-[#64748b] text-[8px] font-bold uppercase tracking-[0.25em]">diseño + corte laser</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-1">CRM Manager v2.0 (Estable)</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMenuOpen(false);}} />
          <NavItem icon={<ShoppingCart />} label="Movimientos" active={activeTab === 'ventas'} onClick={() => {setActiveTab('ventas'); setIsMenuOpen(false);}} />
          <NavItem icon={<Package />} label="Producción" active={activeTab === 'produccion'} onClick={() => {setActiveTab('produccion'); setIsMenuOpen(false);}} />
          <NavItem icon={<Truck />} label="Logística" active={activeTab === 'logistica'} onClick={() => {setActiveTab('logistica'); setIsMenuOpen(false);}} />
          <NavItem icon={<TrendingUp />} label="Inventario" active={activeTab === 'stock'} onClick={() => {setActiveTab('stock'); setIsMenuOpen(false);}} />
          <NavItem icon={<Database />} label="Configuración" active={activeTab === 'config'} onClick={() => {setActiveTab('config'); setIsMenuOpen(false);}} />
          <button onClick={() => {setActiveTab('add'); setIsMenuOpen(false);}} className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'add' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20'}`}>
            <Plus /> Nuevo Movimiento
          </button>
        </div>

        <div className="mt-auto p-4 bg-slate-800/50 rounded-2xl flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isSyncing ? 'Sincronizando' : 'Base de Datos Local'}
          </span>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar text-slate-900">
        {activeTab === 'dashboard' && <DashboardSection stats={stats} />}
        {activeTab === 'config' && (
          <ConfigSection 
            config={config} 
            setConfig={setConfig} 
            onUpdateList={updateConfigList} 
            onSync={fetchFromCloud} 
            onDownloadBackup={downloadBackup} 
            onImport={importTransactions}
            onClear={clearTransactions}
            isSyncing={isSyncing} 
          />
        )}
        {activeTab === 'add' && <TransactionFormSection onAdd={addTransaction} products={products} config={config} isSyncing={isSyncing} onComplete={() => setActiveTab('produccion')} />}
        {activeTab === 'ventas' && <HistorySection transactions={transactions} config={config} onSync={fetchFromCloud} onImport={importTransactions} />}
        {activeTab === 'stock' && <InventorySection stocks={currentStocks} onEdit={setEditingStock} onAddProduct={() => setIsNewProductModalOpen(true)} />}
        {activeTab === 'logistica' && <LogisticsSection transactions={transactions} onUpdate={updateTransaction} onMove={updateTransactionEtapa} onEdit={(tx) => { setLogisticsTx(tx); setIsEditingLogistics(true); }} />}
        {activeTab === 'produccion' && (
          <KanbanSection 
            transactions={transactions} 
            onMove={updateTransactionEtapa} 
            onUpdateFull={updateTransaction} 
            onDelete={deleteTransaction}
            onReorder={reorderTransactions}
            products={products} 
            onQuickAdd={addTransaction} 
            config={config} 
            onLogistics={(tx) => { setLogisticsTx(tx); setIsEditingLogistics(false); }}
          />
        )}
      </main>

      {logisticsTx && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-md space-y-6 animate-in zoom-in-95 shadow-2xl">
            <header className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Truck className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-800">{isEditingLogistics ? 'Actualizar Envío' : 'Preparar Despacho'}</h3>
              </div>
              <button onClick={() => { setLogisticsTx(null); setIsEditingLogistics(false); }} className="text-slate-300 hover:text-slate-500 font-black text-xl">✕</button>
            </header>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              updateTransaction({
                ...logisticsTx,
                etapa: 'Logística',
                medioEnvio: f.get('medioEnvio') as string,
                trackingNumber: f.get('trackingNumber') as string,
                fechaDespacho: logisticsTx.fechaDespacho || new Date().toISOString().split('T')[0]
              });
              setLogisticsTx(null);
              setIsEditingLogistics(false);
            }} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medio de Envío</label>
                <select required name="medioEnvio" defaultValue={logisticsTx.medioEnvio || 'A definir / Pendiente'} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">
                  {MEDIOS_ENVIO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nro de Seguimiento (Opcional)</label>
                <input name="trackingNumber" defaultValue={logisticsTx.trackingNumber || ''} placeholder="Ej: AR123456789" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-600/20">
                {isEditingLogistics ? 'Guardar Cambios' : 'Confirmar Logística'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isNewProductModalOpen && <NewProductModal onSave={(sku, name, stock) => { addProduct(sku, name, stock); setIsNewProductModalOpen(false); }} onClose={() => setIsNewProductModalOpen(false)} products={products} />}
      {editingStock && <EditStockModal sku={editingStock} currentQty={currentStocks.find(s => s.sku === editingStock)?.cantidad || 0} currentMin={currentStocks.find(s => s.sku === editingStock)?.minStock || 10} onSave={(qty, min) => { updateBaseStock(editingStock, qty, min); setEditingStock(null); }} onClose={() => setEditingStock(null)} />}

      <AIChat transactions={transactions} stocks={currentStocks} />
    </div>
  );
};

const DashboardSection: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
    <header><h2 className="text-3xl font-bold text-slate-800 tracking-tight">Panel de Control</h2><p className="text-slate-500">Gestión Integral LaserBeam CRM</p></header>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        label="Ingresos (7 días)" 
        value={`$${formatCurrency(stats.income)}`} 
        totalValue={`Mes: $${formatCurrency(stats.monthlyIncome)} | 30d: $${formatCurrency(stats.last30DaysIncome)}`}
        icon={<TrendingUp className="text-emerald-500" />} 
        color="emerald" 
      />
      <StatCard 
        label="Egresos (7 días)" 
        value={`$${formatCurrency(stats.expense)}`} 
        totalValue={`Mes: $${formatCurrency(stats.monthlyExpense)} | 30d: $${formatCurrency(stats.last30DaysExpense)}`}
        icon={<TrendingUp className="rotate-180 text-rose-500" />} 
        color="rose" 
      />
      <StatCard 
        label="Utilidad (7 días)" 
        value={`$${formatCurrency(stats.balance)}`} 
        totalValue={`Total: $${formatCurrency(stats.totalBalance)}`}
        icon={<LayoutDashboard className="text-blue-500" />} 
        color="blue" 
        subText={`${stats.margin.toFixed(1)}% margen`} 
      />
      <StatCard label="Bajo Stock" value={stats.lowStockItems.length.toString()} icon={<Package className="text-rose-500" />} color="rose" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Ventas (Últimos 7 Días)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis hide />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => `$${formatCurrency(val || 0)}`} />
              <Bar dataKey="income" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Últimos Movimientos</h3>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {stats.recentTransactions?.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${tx.tipo === 'Ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {tx.tipo === 'Ingreso' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate max-w-[120px] sm:max-w-[200px]">{tx.detalle || tx.imputable}</p>
                  <p className="text-[10px] text-slate-500">{tx.fecha} • {tx.proveedor || tx.cliente || 'Varios'}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${tx.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tx.tipo === 'Ingreso' ? '+' : '-'}${formatCurrency(tx.total)}
              </p>
            </div>
          ))}
          {(!stats.recentTransactions || stats.recentTransactions.length === 0) && (
            <div className="text-center py-12">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <LayoutDashboard className="text-slate-300" size={24} />
              </div>
              <p className="text-slate-500 text-sm">No hay movimientos recientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const HistorySection: React.FC<{ transactions: Transaction[], config: any, onSync: () => void, onImport: (txs: Transaction[]) => void }> = ({ transactions, config, onSync, onImport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [vendorFilter, setVendorFilter] = useState('Todos');
  const [proveedorFilter, setProveedorFilter] = useState('Todos');
  const [isMPImporterOpen, setIsMPImporterOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const itemSkus = String(tx.items?.map(i => i.sku).join(' ') || tx.sku || '');
      const matchesSearch = 
        String(tx.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(tx.numeroOrden || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(tx.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(tx.proveedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        itemSkus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(tx.cuenta || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(tx.imputable || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(tx.detalle || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'Todos' || tx.tipo === typeFilter;
      const matchesVendor = vendorFilter === 'Todos' || tx.vendedor === vendorFilter;
      const matchesProveedor = proveedorFilter === 'Todos' || tx.proveedor === proveedorFilter;
      return matchesSearch && matchesType && matchesVendor && matchesProveedor;
    });
  }, [transactions, searchTerm, typeFilter, vendorFilter, proveedorFilter]);

  return (
    <div className="max-w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Movimientos</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMPImporterOpen(true)}
            className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Importar Mercado Pago
          </button>
          <button 
            onClick={onSync}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Database className="w-4 h-4" /> Refrescar Datos
          </button>
        </div>
      </div>

      {isMPImporterOpen && (
        <MercadoPagoImporter 
          onClose={() => setIsMPImporterOpen(false)}
          onImport={(txs) => {
            onImport(txs);
            setIsMPImporterOpen(false);
          }}
          paymentMethods={config.paymentMethods}
        />
      )}
      
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1"><Search className="w-3 h-3" /> Buscar</label>
          <input type="text" placeholder="OT, Cliente, SKU, Detalle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px) font-black text-slate-400 uppercase ml-1">Tipo</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Todos">Todos</option>
            <option value="Ingreso">Ingreso</option>
            <option value="Egreso">Egreso</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Vendedor</label>
          <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Todos">Todos</option>
            {config.vendors.map((v: string) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Proveedor</label>
          <select value={proveedorFilter} onChange={(e) => setProveedorFilter(e.target.value)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Todos">Todos</option>
            {config.suppliers.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-x-scroll custom-scrollbar relative" style={{ maxHeight: '70vh' }}>
        <table className="w-full text-left min-w-[1500px] border-collapse">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="px-6 py-5 bg-slate-50">ID</th>
              <th className="px-6 py-5 bg-slate-50">OT</th>
              <th className="px-6 py-5 bg-slate-50">Fecha</th>
              <th className="px-6 py-5 bg-slate-50">Tipo</th>
              <th className="px-6 py-5 bg-slate-50">Cuenta</th>
              <th className="px-6 py-5 bg-slate-50">Imputable</th>
              <th className="px-6 py-5 bg-slate-50">SKU</th>
              <th className="px-6 py-5 bg-slate-50">Concepto</th>
              <th className="px-6 py-5 bg-slate-50 text-right">Monto</th>
              <th className="px-6 py-5 bg-slate-50">Unid</th>
              <th className="px-6 py-5 bg-slate-50">Estado</th>
              <th className="px-6 py-5 bg-slate-50">Medio Pago</th>
              <th className="px-6 py-5 bg-slate-50">Vendedor</th>
              <th className="px-6 py-5 bg-slate-50">Cliente</th>
              <th className="px-6 py-5 bg-slate-50">Proveedor</th>
              <th className="px-6 py-5 bg-slate-50">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTransactions.map(tx => {
              let displayDate = tx.fecha;
              if (tx.fecha) {
                const s = String(tx.fecha).split(' ')[0].trim();
                const parts = s.split(/[\/\-]/);
                if (parts.length === 3) {
                  let d, m, y;
                  const v0 = parseInt(parts[0]);
                  const v1 = parseInt(parts[1]);
                  const v2 = parseInt(parts[2]);

                  if (parts[0].length === 4) { // YYYY-MM-DD
                    y = v0; m = v1; d = v2;
                  } else { // DD/MM/YYYY or MM/DD/YYYY
                    y = v2 < 100 ? 2000 + v2 : v2;
                    if (v0 > 12) { d = v0; m = v1; }
                    else if (v1 > 12) { d = v1; m = v0; }
                    else { 
                      // Ambiguous. User stated source is MM/DD/YYYY
                      m = v0; d = v1; 
                    }
                  }
                  displayDate = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
                }
              }
              return (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors text-xs">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{tx.id}</td>
                  <td className="px-6 py-4"><span className="text-slate-900 font-bold">{tx.numeroOrden || '-'}</span></td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{displayDate}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${tx.tipo === 'Ingreso' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{tx.tipo}</span></td>
                  <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{tx.cuenta}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{tx.imputable}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tx.tipo === 'Ingreso' && tx.items ? tx.items.map(i => `${i.unidades}x${i.sku}`).join(', ') : tx.sku}
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{tx.concepto}</td>
                  <td className="px-6 py-4 font-black text-slate-900 text-right whitespace-nowrap">${formatCurrency(tx.total)}</td>
                  <td className="px-6 py-4 text-slate-500 font-bold whitespace-nowrap">{tx.unidades}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-600">COMPLETADO</span></td>
                  <td className="px-6 py-4 text-slate-500 font-bold whitespace-nowrap">{tx.medioPago}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{tx.vendedor || '-'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">{tx.cliente || '-'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">{tx.proveedor || '-'}</td>
                  <td className="px-6 py-4 text-slate-400 italic whitespace-nowrap" title={tx.detalle}>{tx.detalle}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KanbanSection: React.FC<{ 
  transactions: Transaction[], 
  onMove: (id: string, etapa: EtapaProduccion) => void, 
  onUpdateFull: (tx: Transaction) => void,
  onDelete: (id: string) => void,
  onReorder: (txs: Transaction[]) => void,
  products: any[], 
  onQuickAdd: (tx: any) => void,
  config: AppConfig,
  onLogistics: (tx: Transaction) => void
}> = ({ transactions, onMove, onUpdateFull, onDelete, onReorder, products, onQuickAdd, config, onLogistics }) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddItems, setQuickAddItems] = useState<TransactionItem[]>([{ sku: '', unidades: 1 }]);
  
  const [confirmingTx, setConfirmingTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [notingTx, setNotingTx] = useState<Transaction | null>(null);
  const [localNotes, setLocalNotes] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<TransactionItem[]>([]);
  const [editingAccount, setEditingAccount] = useState<string>('');
  const [confirmingAccount, setConfirmingAccount] = useState<string>('');

  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (editingTx) {
      setEditItems(editingTx.items && editingTx.items.length > 0 
        ? [...editingTx.items] 
        : [{ sku: editingTx.sku, unidades: editingTx.unidades }]);
      setEditingAccount(editingTx.cuenta);
    }
  }, [editingTx]);

  useEffect(() => {
    if (confirmingTx) {
      setConfirmingAccount(confirmingTx.cuenta);
    }
  }, [confirmingTx]);

  useEffect(() => {
    if (notingTx) {
      setLocalNotes(notingTx.notasProduccion || '');
    }
  }, [notingTx]);
  
  const productionTransactions = useMemo(() => {
    return transactions
      .filter(tx => tx.tipo === 'Ingreso' && tx.estado !== 'Cancelado' && !tx.imputable?.toLowerCase().includes('ajuste'))
      .sort((a, b) => (a.prioridad || 0) - (b.prioridad || 0));
  }, [transactions]);

  const getDeliveryStatus = (dateStr?: string) => {
    if (!dateStr) return { color: 'border-slate-100', text: 'Sin fecha', urgency: 'none' };
    const today = new Date();
    today.setHours(0,0,0,0);
    const delivery = new Date(dateStr);
    const diff = delivery.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { color: 'border-rose-600 bg-rose-50/40', text: `Vencido ${Math.abs(days)}d`, urgency: 'high' };
    if (days === 0) return { color: 'border-rose-500 bg-rose-50/20', text: '¡Vence Hoy!', urgency: 'high' };
    if (days <= 2) return { color: 'border-amber-500 bg-amber-50/20', text: `Faltan ${days}d`, urgency: 'medium' };
    return { color: 'border-blue-500', text: `Faltan ${days}d`, urgency: 'low' };
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetEtapa: EtapaProduccion) => {
    e.preventDefault();
    if (!draggedId) return;

    const sourceTx = transactions.find(t => t.id === draggedId);
    if (!sourceTx) return;

    if (sourceTx.etapa !== targetEtapa) {
      if (targetEtapa === 'Logística') {
        onLogistics(sourceTx);
      } else {
        onMove(draggedId, targetEtapa);
      }
    } else if (targetId && targetId !== draggedId) {
      const stageItems = productionTransactions.filter(t => t.etapa === targetEtapa);
      const sIdx = stageItems.findIndex(t => t.id === draggedId);
      const tIdx = stageItems.findIndex(t => t.id === targetId);

      const newStageItems = [...stageItems];
      const [moved] = newStageItems.splice(sIdx, 1);
      newStageItems.splice(tIdx, 0, moved);

      const now = Date.now();
      newStageItems.forEach((item, i) => {
        item.prioridad = now + i;
      });

      onReorder(newStageItems);
    }
    setDraggedId(null);
  };

  const handleAdvance = (tx: Transaction, currentIdx: number) => {
    const nextEtapa = ETAPAS_PRODUCCION[currentIdx + 1];
    if (tx.etapa === 'Pedido Potencial' && nextEtapa === 'Pedido Confirmado') {
      setConfirmingTx(tx);
    } else if (nextEtapa === 'Logística') {
      onLogistics(tx);
    } else {
      onMove(tx.id, nextEtapa);
    }
  };

  const handleEditSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTx) return;
    const f = new FormData(e.currentTarget);
    const updated: Transaction = {
      ...editingTx,
      fecha: (f.get('fecha') as string) || editingTx.fecha,
      fechaEntrega: f.get('fechaEntrega') as string,
      cliente: f.get('cliente') as string,
      detalle: f.get('detalle') as string,
      total: Number(f.get('total')),
      vendedor: f.get('vendedor') as string,
      medioPago: f.get('medioPago') as string,
      cuenta: f.get('cuenta') as string,
      imputable: f.get('imputable') as string,
      concepto: (f.get('concepto') as any) || editingTx.concepto,
      estado: f.get('estado') as any,
      etapa: f.get('etapa') as any,
      items: editItems,
      sku: editItems[0]?.sku || 'VARIOS',
      unidades: editItems.reduce((acc, i) => acc + i.unidades, 0)
    };
    onUpdateFull(updated);
    setEditingTx(null);
  };

  const handleConfirmPurchase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirmingTx) return;
    const f = new FormData(e.currentTarget);
    const updated: Transaction = {
      ...confirmingTx,
      total: Number(f.get('total')),
      medioPago: f.get('medioPago') as string,
      cuenta: f.get('cuenta') as string,
      imputable: f.get('imputable') as string,
      vendedor: f.get('vendedor') as string,
      etapa: 'Pedido Confirmado',
    };
    onUpdateFull(updated);
    setConfirmingTx(null);
  };

  return (
    <div className="h-full space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div><h2 className="text-3xl font-bold text-slate-800 tracking-tight">Producción LaserBeam</h2><p className="text-slate-500">Gestión de flujo de trabajo del taller</p></div>
        <button onClick={() => { setIsQuickAddOpen(true); setQuickAddItems([{ sku: '', unidades: 1 }]); }} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Plus className="w-5 h-5" /> Nueva Solicitud
        </button>
      </header>
      
      <div className="flex gap-4 overflow-x-auto pb-8 custom-scrollbar h-[calc(100vh-220px)] items-start">
        {ETAPAS_PRODUCCION.map((etapa, idx) => {
          const itemsInEtapa = productionTransactions.filter(tx => (tx.etapa || 'Pedido Confirmado') === etapa);
          return (
            <div key={etapa} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, '', etapa)} className="flex-shrink-0 w-80 flex flex-col gap-4 bg-slate-100/40 p-5 rounded-[2.2rem] border border-slate-200/60 max-h-full">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 truncate">{etapa}</h3>
                <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full shadow-sm">{itemsInEtapa.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar px-1 pb-4">
                {itemsInEtapa.map(tx => {
                  const status = getDeliveryStatus(tx.fechaEntrega);
                  return (
                    <div 
                      key={tx.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, tx.id)} 
                      onDragOver={handleDragOver} 
                      onDrop={(e) => { e.stopPropagation(); handleDrop(e, tx.id, etapa); }}
                      className={`bg-white p-4 rounded-3xl shadow-sm border-l-[5px] ${status.color} ${draggedId === tx.id ? 'opacity-40 scale-95' : 'opacity-100'} hover:shadow-lg transition-all group relative cursor-grab active:cursor-grabbing`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-0">
                          <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{tx.numeroOrden}</h4>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate block max-w-[120px]">{tx.cliente}</span>
                        </div>
                        {tx.fechaEntrega && (
                          <div className={`text-[9px] font-black px-2 py-1 rounded-lg border ${status.color} flex flex-col items-end gap-0.5`}>
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${status.urgency === 'high' ? 'bg-rose-500 animate-pulse' : status.urgency === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                              {status.text}
                            </div>
                            <span className="opacity-60 text-[8px]">{tx.fechaEntrega}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 mb-4 bg-slate-50/50 p-3 rounded-2xl">
                        {(tx.items && tx.items.length > 0 ? tx.items : [{ sku: tx.sku, unidades: tx.unidades }]).slice(0, 4).map((item, i) => (
                          <div key={i} className="text-[10px] font-bold text-slate-500 flex justify-between items-center">
                            <span className="truncate mr-2">{item.sku}</span>
                            <span className="text-slate-400 font-black">x{item.unidades}</span>
                          </div>
                        ))}
                        {tx.items && tx.items.length > 4 && (
                          <div className="text-[9px] text-slate-400 font-bold italic text-center pt-1 border-t border-slate-100 mt-1">+{tx.items.length - 4} más</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-3">
                        {idx > 0 ? (
                          <button onClick={() => onMove(tx.id, ETAPAS_PRODUCCION[idx - 1])} className="p-2 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 transition-colors" title="Volver">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        ) : <div className="w-8" />}
                        
                        <div className="flex-1 flex justify-center gap-1.5 px-1">
                          <button onClick={() => setNotingTx(tx)} className={`p-2 rounded-xl border transition-colors ${tx.notasProduccion ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-400 border-slate-100 hover:text-indigo-600 bg-white'}`} title="Notas">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingTx(tx)} className="p-2 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-100 transition-colors" title="Editar">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>

                        {idx < ETAPAS_PRODUCCION.length - 1 ? (
                          <button onClick={() => handleAdvance(tx, idx)} className={`px-3 py-2 rounded-xl text-white text-[9px] font-black uppercase flex items-center gap-1 ${etapa === 'Pedido Potencial' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            Sig <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : <div className="w-10" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {isQuickAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-lg space-y-6 animate-in zoom-in-95 shadow-2xl">
            <header className="flex justify-between items-center">
              <div><h3 className="text-2xl font-black text-slate-800">Nueva Solicitud</h3></div>
              <button onClick={() => setIsQuickAddOpen(false)} className="text-slate-300 hover:text-slate-500 font-black text-xl">✕</button>
            </header>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              onQuickAdd({
                id: Date.now().toString(),
                fecha: new Date().toISOString().split('T')[0],
                fechaEntrega: f.get('fechaEntrega') as string,
                tipo: 'Ingreso',
                cuenta: 'Ventas',
                imputable: 'Ventas LaserBeam',
                sku: quickAddItems[0].sku || 'VARIOS',
                total: 0,
                concepto: 'Seña',
                estado: 'Pendiente',
                etapa: 'Diseño Solicitado',
                medioPago: 'Pendiente Cobro',
                unidades: quickAddItems.reduce((acc, i) => acc + i.unidades, 0),
                items: quickAddItems,
                cliente: f.get('cliente') as string,
                vendedor: 'Julian',
                detalle: f.get('detalle') as string,
                numeroOrden: `OT-${Date.now().toString().slice(-4)}`
              });
              setIsQuickAddOpen(false);
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Cliente</label><input required name="cliente" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Entrega Pactada</label><input required type="date" name="fechaEntrega" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" /></div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase">Productos</label><button type="button" onClick={() => setQuickAddItems([...quickAddItems, { sku: '', unidades: 1 }])} className="text-[10px] font-bold text-blue-600">+ Añadir</button></div>
                {quickAddItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select required value={item.sku} onChange={(e) => { const n = [...quickAddItems]; n[idx].sku = e.target.value; setQuickAddItems(n); }} className="flex-1 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs"><option value="" disabled>Seleccionar SKU...</option>{products.map(p => <option key={p.sku} value={p.sku}>{p.sku} - {p.nombre}</option>)}</select>
                    <input type="number" min="1" value={item.unidades} onChange={(e) => { const n = [...quickAddItems]; n[idx].unidades = parseInt(e.target.value); setQuickAddItems(n); }} className="w-20 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-center font-black" />
                  </div>
                ))}
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Notas</label><textarea required name="detalle" rows={3} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" /></div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg">Crear Solicitud</button>
            </form>
          </div>
        </div>
      )}

      {editingTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-2xl space-y-6 animate-in zoom-in-95 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <header className="flex justify-between items-center">
              <div><h3 className="text-2xl font-black text-slate-800">Editar Pedido {editingTx.numeroOrden}</h3></div>
              <button onClick={() => setEditingTx(null)} className="text-slate-300 hover:text-slate-500 font-black text-xl">✕</button>
            </header>
            <form onSubmit={handleEditSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Fecha Movimiento</label><input required name="fecha" type="date" defaultValue={editingTx.fecha?.includes('/') ? new Date(editingTx.fecha.split('/').reverse().join('-')).toISOString().split('T')[0] : editingTx.fecha} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Cliente</label><input required name="cliente" defaultValue={editingTx.cliente} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Fecha Entrega</label><input required name="fechaEntrega" type="date" defaultValue={editingTx.fechaEntrega} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Concepto</label><select name="concepto" defaultValue={editingTx.concepto} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">{CONCEPTOS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Vendedor</label><select name="vendedor" defaultValue={editingTx.vendedor} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">{config.vendors.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Cuenta</label><select name="cuenta" value={editingAccount} onChange={(e) => setEditingAccount(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">{(editingTx.tipo === 'Ingreso' ? config.accountsIngresos : config.accountsEgresos).map((t: string) => <option key={t} value={t}>{t}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Imputable</label><select name="imputable" defaultValue={editingTx.imputable} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">{(ACCOUNT_IMPUTABLE_MAP[editingAccount] || []).map((t: string) => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 space-y-4">
                <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase">Productos</label><button type="button" onClick={() => setEditItems([...editItems, { sku: '', unidades: 1 }])} className="text-[10px] font-bold text-indigo-600">+ Añadir</button></div>
                {editItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <select required value={item.sku} onChange={(e) => { const n = [...editItems]; n[idx].sku = e.target.value; setEditItems(n); }} className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm"><option value="" disabled>SKU...</option>{products.map(p => <option key={p.sku} value={p.sku}>{p.sku} - {p.nombre}</option>)}</select>
                    <input type="number" min="1" value={item.unidades} onChange={(e) => { const n = [...editItems]; n[idx].unidades = parseInt(e.target.value); setEditItems(n); }} className="w-24 p-3 bg-white border border-slate-200 rounded-xl text-center" />
                    {editItems.length > 1 && <button type="button" onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))} className="p-3 text-rose-400">✕</button>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Total ($)</label><input name="total" type="number" step="0.01" defaultValue={editingTx.total} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Medio Pago</label><select name="medioPago" defaultValue={editingTx.medioPago} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">{config.paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Vendedor</label><select name="vendedor" defaultValue={editingTx.vendedor} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">{config.vendors.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Estado</label><select name="estado" defaultValue={editingTx.estado} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">{ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Etapa</label><select name="etapa" defaultValue={editingTx.etapa} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">{ETAPAS_PRODUCCION.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Detalle</label><textarea name="detalle" defaultValue={editingTx.detalle} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" /></div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { onUpdateFull({ ...editingTx, estado: 'Cancelado' }); setEditingTx(null); }} className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold">Cancelar Pedido</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-xs space-y-6 animate-in zoom-in-95 shadow-2xl text-center">
            <h3 className="text-xl font-bold text-slate-800">¿Eliminar pedido?</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => { onDelete(deletingId); setDeletingId(null); }} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold">Eliminar Definitivamente</button>
              <button onClick={() => setDeletingId(null)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {confirmingTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-lg space-y-6 animate-in zoom-in-95 shadow-2xl">
            <header className="flex justify-between items-center"><div><h3 className="text-2xl font-black text-slate-800">Confirmar Venta</h3></div><button onClick={() => setConfirmingTx(null)} className="text-slate-300 font-black text-xl">✕</button></header>
            <form onSubmit={handleConfirmPurchase} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Cuenta</label><select required name="cuenta" value={confirmingAccount} onChange={(e) => setConfirmingAccount(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">{config.accountsIngresos.map((t: string) => <option key={t} value={t}>{t}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Imputable</label><select required name="imputable" defaultValue={confirmingTx.imputable} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">{(ACCOUNT_IMPUTABLE_MAP[confirmingAccount] || []).map((t: string) => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Vendedor</label><select required name="vendedor" defaultValue={confirmingTx.vendedor} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">{config.vendors.map((v: string) => <option key={v} value={v}>{v}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Medio Pago</label><select required name="medioPago" defaultValue={confirmingTx.medioPago} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">{config.paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Total ($)</label><input required name="total" type="number" step="0.01" defaultValue={confirmingTx.total} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black" /></div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-lg">Confirmar y Avanzar</button>
            </form>
          </div>
        </div>
      )}

      {notingTx && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md space-y-6 animate-in zoom-in-95 shadow-2xl">
            <header className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><MessageSquare className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-800">Notas de Producción</h3>
              </div>
              <button onClick={() => setNotingTx(null)} className="text-slate-300 hover:text-slate-500 font-black text-xl">✕</button>
            </header>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pedido: {notingTx.numeroOrden} - {notingTx.cliente}</p>
              <textarea 
                autoFocus
                value={localNotes} 
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="Escribe aquí detalles técnicos, cambios en el diseño o especificaciones del cliente..."
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm min-h-[200px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setNotingTx(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
              <button 
                onClick={() => {
                  onUpdateFull({ ...notingTx, notasProduccion: localNotes });
                  setNotingTx(null);
                }} 
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Guardar Notas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TransactionFormSection: React.FC<{ onAdd: (tx: any) => void, products: any[], config: any, isSyncing: boolean, onComplete: () => void }> = ({ onAdd, products, config, isSyncing, onComplete }) => {
  const [formType, setFormType] = useState<TransactionType>('Ingreso');
  const [items, setItems] = useState<TransactionItem[]>([{ sku: '', unidades: 1 }]);
  const [key, setKey] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  useEffect(() => {
    setSelectedAccount('');
  }, [formType, key]);

  const addItemRow = () => setItems([...items, { sku: '', unidades: 1 }]);
  const removeItemRow = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof TransactionItem, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const total = Math.round(Number(formData.get('total')) * 100) / 100;

    const newTx: any = {
      id: Date.now().toString(),
      fecha: formData.get('fecha') as string,
      tipo: formType,
      cuenta: formData.get('cuenta') as AccountType,
      imputable: formData.get('imputable') as any,
      sku: formType === 'Ingreso' ? (items[0]?.sku || 'VARIOS') : 'OTROS',
      total: total,
      concepto: formData.get('concepto') as any,
      estado: formData.get('estado') as any,
      etapa: formType === 'Ingreso' ? 'Pedido Confirmado' : undefined,
      fechaEntrega: formData.get('fechaEntrega') as string || undefined,
      medioPago: formData.get('medioPago') as any,
      unidades: formType === 'Ingreso' ? items.reduce((acc, i) => acc + i.unidades, 0) : 0,
      items: formType === 'Ingreso' ? items : [],
      proveedor: formData.get('proveedor') as any,
      cliente: formData.get('cliente') as string,
      vendedor: formData.get('vendedor') as any,
      detalle: formData.get('detalle') as string,
      numeroOrden: formType === 'Ingreso' ? `OT-${Date.now().toString().slice(-4)}` : ''
    };
    onAdd(newTx);
    setKey(k => k + 1);
    setItems([{ sku: '', unidades: 1 }]);
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
      <div className={`bg-white p-10 rounded-[2.5rem] shadow-2xl border-t-[12px] ${formType === 'Ingreso' ? 'border-emerald-500' : 'border-rose-500'}`}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Nueva Operación</h2>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setFormType('Ingreso')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${formType === 'Ingreso' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Ingreso</button>
            <button onClick={() => setFormType('Egreso')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${formType === 'Egreso' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>Egreso</button>
          </div>
        </div>
        <form key={key} onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Fecha</label><input required name="fecha" type="date" defaultValue={new Date().toLocaleDateString('en-CA')} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Cuenta</label><select required name="cuenta" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option value="" disabled>Seleccionar Cuenta...</option>{(formType === 'Ingreso' ? config.accountsIngresos : config.accountsEgresos).map((t: string) => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Imputable</label><select required name="imputable" defaultValue="" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option value="" disabled>Seleccionar Imputable...</option>{(ACCOUNT_IMPUTABLE_MAP[selectedAccount] || []).map((t: string) => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Vendedor</label><select required name="vendedor" defaultValue="" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option value="" disabled>Seleccionar Vendedor...</option>{config.vendors.map((v: string) => <option key={v} value={v}>{v}</option>)}</select></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">{formType === 'Ingreso' ? 'Cliente' : 'Proveedor'}</label>
              {formType === 'Egreso' && selectedAccount === 'Servicios' ? (
                <select required name="proveedor" defaultValue="" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">
                  <option value="" disabled>Seleccionar Proveedor...</option>
                  {SERVICIOS_SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <input required name={formType === 'Ingreso' ? 'cliente' : 'proveedor'} placeholder={formType === 'Ingreso' ? 'Nombre del cliente...' : 'Nombre del proveedor...'} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
              )}
            </div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Medio de Pago</label><select required name="medioPago" defaultValue="" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option value="" disabled>Seleccionar Pago...</option>{config.paymentMethods.map((m: string) => <option key={m} value={m}>{m}</option>)}</select></div>
          </div>

          {formType === 'Ingreso' && (
            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 space-y-4">
              <div className="flex justify-between items-center"><h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Productos</h3><button type="button" onClick={addItemRow} className="text-xs font-bold text-indigo-600">+ Añadir</button></div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <select required value={item.sku} onChange={(e) => updateItem(idx, 'sku', e.target.value)} className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm"><option value="" disabled>SKU...</option>{products.map(p => <option key={p.sku} value={p.sku}>{p.sku} - {p.nombre}</option>)}</select>
                  <input type="number" min="1" value={item.unidades} onChange={(e) => updateItem(idx, 'unidades', parseInt(e.target.value) || 1)} className="w-24 p-3 bg-white border border-slate-200 rounded-xl text-center font-black" />
                  {items.length > 1 && <button type="button" onClick={() => removeItemRow(idx)} className="p-3 text-rose-400">✕</button>}
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Total ($)</label><input required name="total" type="number" step="0.01" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Concepto</label><select required name="concepto" defaultValue="Total" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">{CONCEPTOS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Estado</label><select required name="estado" defaultValue="Completado" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">{ESTADOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            {formType === 'Ingreso' && <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Fecha Entrega</label><input name="fechaEntrega" type="date" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" /></div>}
            <div className="md:col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Detalle</label><textarea name="detalle" rows={2} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" /></div>
          </div>
          <div className="pt-6"><button type="submit" disabled={isSyncing} className={`w-full py-5 text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all ${formType === 'Ingreso' ? 'bg-emerald-600' : 'bg-rose-600'}`}>{isSyncing ? 'Guardando...' : `Guardar`}</button></div>
        </form>
      </div>
    </div>
  );
};

const LogisticsSection: React.FC<{ transactions: Transaction[], onUpdate: (tx: Transaction) => void, onMove: (id: string, etapa: EtapaProduccion) => void, onEdit: (tx: Transaction) => void }> = ({ transactions, onUpdate, onMove, onEdit }) => {
  const logisticsItems = useMemo(() => {
    return transactions.filter(tx => tx.etapa === 'Logística' && tx.estado !== 'Cancelado');
  }, [transactions]);

  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    MEDIOS_ENVIO.forEach(m => groups[m] = []);
    groups['Otros'] = [];
    
    logisticsItems.forEach(tx => {
      const key = tx.medioEnvio && MEDIOS_ENVIO.includes(tx.medioEnvio) ? tx.medioEnvio : 'Otros';
      groups[key].push(tx);
    });
    return groups;
  }, [logisticsItems]);

  const handleComplete = (tx: Transaction) => {
    onUpdate({ ...tx, etapa: 'Completado', estado: 'Completado', fechaDespacho: new Date().toISOString().split('T')[0] });
  };

  const CARRIER_THEMES: Record<string, { bg: string, border: string, text: string, accent: string, icon: React.ReactNode }> = {
    'Andreani': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', accent: 'bg-rose-600', icon: <Truck className="w-4 h-4" /> },
    'Correo Argentino': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500', icon: <Truck className="w-4 h-4" /> },
    'Via Cargo': { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700', accent: 'bg-lime-500', icon: <Truck className="w-4 h-4" /> },
    'Uber entregas': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900', accent: 'bg-slate-900', icon: <Truck className="w-4 h-4" /> },
    'Retiro en Taller': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'bg-emerald-800', icon: <MapPin className="w-4 h-4" /> },
    'Expreso': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', accent: 'bg-violet-600', icon: <Truck className="w-4 h-4" /> },
    'A definir / Pendiente': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-400', accent: 'bg-slate-300', icon: <MessageSquare className="w-4 h-4" /> },
    'Otros': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', accent: 'bg-slate-500', icon: <Truck className="w-4 h-4" /> }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Hoja de Ruta / Logística</h2>
          <p className="text-slate-500">Gestión de despachos y entregas agrupados por transporte</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-400">Pendientes: {grouped['A definir / Pendiente']?.length || 0}</span>
          </div>
          <div className="w-px h-4 bg-slate-100" />
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black uppercase text-slate-400">Total: {logisticsItems.length}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([medio, items]) => {
          const theme = CARRIER_THEMES[medio] || CARRIER_THEMES['Otros'];
          return items.length > 0 && (
            <div key={medio} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className={`p-2 rounded-xl ${theme.bg} ${theme.text}`}>{theme.icon}</div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 truncate">{medio}</h3>
                <span className={`ml-auto ${theme.bg} ${theme.text} text-[10px] font-black px-3 py-1 rounded-full`}>{items.length}</span>
              </div>

              <div className="space-y-4">
                {items.map(tx => (
                  <div key={tx.id} className="relative group">
                    {/* Postal Card Design - Medium */}
                    <div className={`bg-white rounded-3xl border-2 border-dashed ${theme.border} p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden`}>
                      {/* Stamp Area - Medium */}
                      <div className="absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none">
                        <div className={`absolute top-3 right-3 w-10 h-10 border-2 border-current rounded flex items-center justify-center rotate-12 ${theme.text}`}>
                          <span className="font-black text-[7px] uppercase">LASER</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-0">
                          <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{tx.numeroOrden}</h4>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate block max-w-[140px]">{tx.cliente || tx.proveedor}</span>
                        </div>
                        <div className={`w-2 h-10 rounded-full ${theme.accent} opacity-20`} />
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                          <div className="space-y-1">
                            {tx.items?.slice(0, 3).map((i, idx) => (
                              <div key={idx} className="flex justify-between text-xs font-bold text-slate-600">
                                <span className="truncate mr-2">{i.sku}</span>
                                <span className="text-slate-400">x{i.unidades}</span>
                              </div>
                            )) || (
                              <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span className="truncate mr-2">{tx.sku}</span>
                                <span className="text-slate-400">x{tx.unidades}</span>
                              </div>
                            )}
                            {tx.items && tx.items.length > 3 && (
                              <div className="text-[9px] text-slate-400 font-bold italic pt-1 border-t border-slate-100 mt-1">+{tx.items.length - 3} más...</div>
                            )}
                          </div>
                        </div>

                        {tx.trackingNumber && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                            <Truck className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-wider truncate">{tx.trackingNumber}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => onEdit(tx)} 
                          className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                          <Edit3 className="w-3 h-3" /> Editar
                        </button>
                        <button 
                          onClick={() => handleComplete(tx)} 
                          className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                        >
                          <Check className="w-3 h-3" /> OK
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {logisticsItems.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <Truck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">No hay pedidos pendientes de despacho.</p>
        </div>
      )}
    </div>
  );
};

const InventorySection: React.FC<{ stocks: any[], onEdit: (sku: SKUCode) => void, onAddProduct: () => void }> = ({ stocks, onEdit, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredStocks = useMemo(() => {
    return stocks.filter(s => 
      s.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stocks, searchTerm]);

  const lowStockCount = stocks.filter(s => s.cantidad <= s.minStock).length;
  const totalItems = stocks.reduce((acc, s) => acc + s.cantidad, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Inventario</h2>
          <p className="text-slate-500">Control de stock y alertas de reposición</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button onClick={onAddProduct} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" /> Nuevo SKU
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Unidades" 
          value={totalItems.toString()} 
          icon={<Package className="w-6 h-6 text-indigo-600" />} 
          color="indigo" 
        />
        <StatCard 
          label="SKUs Registrados" 
          value={stocks.length.toString()} 
          icon={<LayoutDashboard className="w-6 h-6 text-blue-600" />} 
          color="blue" 
        />
        <StatCard 
          label="Alertas de Stock" 
          value={lowStockCount.toString()} 
          icon={<TrendingUp className={`w-6 h-6 ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />} 
          color={lowStockCount > 0 ? "rose" : "emerald"} 
          subText={lowStockCount > 0 ? "Requiere atención" : "Stock saludable"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStocks.map((item) => {
          const isLow = item.cantidad <= item.minStock;
          return (
            <div key={item.sku} className={`bg-white p-8 rounded-[2.5rem] shadow-sm border-2 ${isLow ? 'border-rose-200' : 'border-slate-100'} group relative transition-all hover:shadow-md hover:translate-y-[-4px]`}>
              <button onClick={() => onEdit(item.sku)} className="absolute top-6 right-6 p-2.5 text-slate-300 hover:text-indigo-600 transition-all"><Edit3 className="w-5 h-5" /></button>
              <div className={`p-4 w-fit rounded-2xl mb-6 ${isLow ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}><Package className="w-8 h-8" /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">{item.sku}</span>
              <h3 className="font-bold text-xl text-slate-800 mb-6 line-clamp-1">{item.nombre}</h3>
              <div className="flex items-baseline gap-2">
                <span className={`text-6xl font-black tracking-tighter ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{item.cantidad}</span>
                <span className="text-slate-400 font-bold text-sm uppercase">Unids</span>
              </div>
              {isLow && (
                <div className="mt-4 text-[10px] font-black text-rose-500 uppercase flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> 
                  Reponer pronto (Mín: {item.minStock})
                </div>
              )}
            </div>
          );
        })}
        {filteredStocks.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 italic">
            No se encontraron productos con ese criterio.
          </div>
        )}
      </div>
    </div>
  );
};

const ListManager: React.FC<{ title: string, list: string[], onUpdate: (newList: string[]) => void, placeholder: string }> = ({ title, list, onUpdate, placeholder }) => {
  const [newItem, setNewItem] = useState('');
  const addItem = () => { if (newItem.trim()) { onUpdate([...list, newItem.trim()]); setNewItem(''); } };
  const removeItem = (index: number) => { onUpdate(list.filter((_, i) => i !== index)); };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      <div className="flex gap-2"><input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={placeholder} className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" /><button onClick={addItem} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold">+</button></div>
      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
        {list.map((item, idx) => (
          <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold border border-slate-200">{item}<button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-rose-500">✕</button></span>
        ))}
      </div>
    </div>
  );
};

const ConfigSection: React.FC<{ 
  config: AppConfig, 
  setConfig: any, 
  onUpdateList: (key: keyof Omit<AppConfig, 'sheetUrl'>, list: string[]) => void, 
  onSync: () => void, 
  onDownloadBackup: () => void,
  onImport: (txs: Transaction[]) => void,
  onClear: () => void,
  isSyncing: boolean 
}> = ({ config, setConfig, onUpdateList, onSync, onDownloadBackup, onImport, onClear, isSyncing }) => {
  const [activeConfigTab, setActiveConfigTab] = useState<'db' | 'proveedores' | 'pagos' | 'vendedores' | 'categorias' | 'importar'>('db');
  const [importStatus, setImportStatus] = useState('');
  const [importPreview, setImportPreview] = useState<Transaction[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportClearConfirm, setShowImportClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processData(text);
    };
    reader.readAsText(file);
  };

  const processData = (text: string) => {
    if (!text.trim()) return;
    try {
      const allLines = text.trim().split('\n').filter(l => l.trim());
      if (allLines.length < 2) throw new Error("Se necesitan al menos 2 filas (encabezado y datos)");
      
      // Detect separator more reliably
      const sample = allLines.slice(0, 5).join('\n');
      const counts = {
        '\t': (sample.match(/\t/g) || []).length,
        ';': (sample.match(/;/g) || []).length,
        ',': (sample.match(/,/g) || []).length
      };
      let sep: '\t' | ';' | ',' = '\t';
      if (counts[';'] > counts[sep]) sep = ';';
      if (counts[','] > counts[sep]) sep = ',';

      const splitCSV = (line: string, separator: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === separator && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const fieldMap: Record<string, string> = {
        'numeroorden': 'numeroOrden', 'orden': 'numeroOrden', 'ot': 'numeroOrden', 'nro orden': 'numeroOrden', 'nro_orden': 'numeroOrden', 'nro. orden': 'numeroOrden',
        'fecha': 'fecha', 'date': 'fecha', 'dia': 'fecha',
        'tipo': 'tipo', 'type': 'tipo', 'clase': 'tipo', 'rubro': 'tipo',
        'cuenta': 'cuenta', 'account': 'cuenta', 'caja': 'cuenta',
        'imputable': 'imputable', 'categoria': 'imputable', 'category': 'imputable',
        'sku': 'sku', 'producto': 'sku', 'product': 'sku', 'item': 'sku', 'codigo': 'sku', 'cod. producto': 'sku',
        'total': 'total', 'monto': 'total', 'importe': 'total', 'amount': 'total', 'precio': 'total', 'valor': 'total', 'total venta': 'total',
        'concepto': 'concepto', 'concept': 'concepto', 'motivo': 'concepto',
        'estado': 'estado', 'status': 'estado', 'situacion': 'estado',
        'mediopago': 'medioPago', 'pago': 'medioPago', 'medio de pago': 'medioPago', 'payment': 'medioPago', 'forma de pago': 'medioPago', 'medio de pago/cobro': 'medioPago',
        'unidades': 'unidades', 'cantidad': 'unidades', 'cant': 'unidades', 'quantity': 'unidades', 'qty': 'unidades', 'unidades x pedido': 'unidades',
        'cliente': 'cliente', 'nombre': 'cliente', 'customer': 'cliente', 'client': 'cliente', 'destinatario': 'cliente', 'proveedor': 'cliente',
        'vendedor': 'vendedor', 'vendor': 'vendedor', 'seller': 'vendedor', 'comercial': 'vendedor',
        'detalle': 'detalle', 'observaciones': 'detalle', 'comentarios': 'detalle', 'detail': 'detalle', 'obs': 'detalle', 'descripcion': 'detalle', 'datos detalle': 'detalle',
        'notas': 'notasProduccion', 'notes': 'notasProduccion', 'notas produccion': 'notasProduccion',
        'fechaentrega': 'fechaEntrega', 'entrega': 'fechaEntrega', 'fecha de entrega': 'fechaEntrega', 'delivery': 'fechaEntrega', 'pactado': 'fechaEntrega'
      };

      // Find the best header row
      let bestHeaderIdx = 0;
      let maxMatches = -1;
      
      for (let i = 0; i < Math.min(10, allLines.length); i++) {
        const cols = splitCSV(allLines[i], sep).map(c => c.trim().toLowerCase().replace(/^\uFEFF/, ""));
        const matches = cols.filter(c => fieldMap[c]).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestHeaderIdx = i;
        }
      }

      const rawHeader = splitCSV(allLines[bestHeaderIdx], sep).map(h => h.trim().toLowerCase().replace(/^\uFEFF/, ""));
      const dataLines = allLines.slice(bestHeaderIdx + 1);
      
      const processed = dataLines.map((line, lineIdx) => {
        const values = splitCSV(line, sep);
        const tx: any = { id: `imp_${Date.now()}_${lineIdx}_${Math.random().toString(36).substr(2, 5)}` };
        
        rawHeader.forEach((colName, colIdx) => {
          const val = values[colIdx]?.trim();
          if (val === undefined || val === '') return;

          const technicalKey = fieldMap[colName] || colName;
          
          if (technicalKey === 'total' || technicalKey === 'unidades' || technicalKey === 'prioridad') {
            let cleanVal = val.replace(/[$]/g, '').trim();
            if (cleanVal.includes('.') && cleanVal.includes(',')) {
              if (cleanVal.lastIndexOf('.') < cleanVal.lastIndexOf(',')) {
                cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
              } else {
                cleanVal = cleanVal.replace(/,/g, '');
              }
            } else if (cleanVal.includes(',')) {
              const parts = cleanVal.split(',');
              if (parts[parts.length - 1].length === 2) {
                cleanVal = cleanVal.replace(',', '.');
              } else {
                cleanVal = cleanVal.replace(/,/g, '');
              }
            } else if (cleanVal.includes('.')) {
              const parts = cleanVal.split('.');
              if (parts[parts.length - 1].length === 3) {
                cleanVal = cleanVal.replace(/\./g, '');
              }
            }
            const num = Number(cleanVal);
            tx[technicalKey] = isNaN(num) ? 0 : num;
          } else if (technicalKey === 'fecha' || technicalKey === 'fechaEntrega') {
            // Database import from Google Sheets is MM/DD/YYYY
            const s = val.split(' ')[0].trim();
            const parts = s.split(/[\/\-]/);
            if (parts.length === 3) {
              let d, m, y;
              const v0 = parts[0];
              const v1 = parts[1];
              const v2 = parts[2];
              if (v0.length === 4) { // YYYY-MM-DD
                tx[technicalKey] = `${v0}-${v1.padStart(2, '0')}-${v2.padStart(2, '0')}`;
              } else {
                // MM/DD/YYYY
                y = v2.length === 2 ? '20' + v2 : v2;
                m = v0.padStart(2, '0');
                d = v1.padStart(2, '0');
                tx[technicalKey] = `${y}-${m}-${d}`;
              }
            } else {
              tx[technicalKey] = val;
            }
          } else if (technicalKey === 'tipo') {
            const lowerVal = val.toLowerCase();
            if (lowerVal.includes('egreso') || lowerVal.includes('gasto')) tx.tipo = 'Egreso';
            else if (lowerVal.includes('ingreso') || lowerVal.includes('venta')) tx.tipo = 'Ingreso';
            else tx.tipo = 'Ingreso';
          } else if (technicalKey === 'concepto') {
            const lowerVal = val.toLowerCase();
            if (lowerVal.includes('seña')) tx.concepto = 'Seña';
            else if (lowerVal.includes('saldo')) tx.concepto = 'Saldo';
            else if (lowerVal.includes('total')) tx.concepto = 'Total';
            else tx.concepto = 'Total';
          } else if (technicalKey === 'items') {
            try {
              if (val.startsWith('[')) {
                tx[technicalKey] = JSON.parse(val);
              } else {
                tx[technicalKey] = val.split(',').map(item => {
                  const parts = item.trim().split('x');
                  if (parts.length === 2) {
                    return { sku: parts[1].trim(), unidades: parseInt(parts[0]) || 1 };
                  }
                  return { sku: item.trim(), unidades: 1 };
                });
              }
            } catch (e) { console.warn("Error parsing items", e); }
          } else {
            tx[technicalKey] = val;
          }
        });

        if (!tx.fecha) tx.fecha = new Date().toISOString().split('T')[0];
        if (!tx.tipo) tx.tipo = 'Ingreso';
        if (!tx.estado) tx.estado = 'Completado';
        if (tx.total === undefined) tx.total = 0;
        if (tx.unidades === undefined) tx.unidades = 1;
        tx.prioridad = Date.now() + lineIdx;

        return tx as Transaction;
      });

      const clientsWithTotal = new Set(
        processed
          .filter(tx => tx.tipo === 'Ingreso' && tx.concepto === 'Total')
          .map(tx => tx.cliente?.toLowerCase().trim())
      );

      const finalProcessed = processed
        .filter(tx => tx.numeroOrden || tx.cliente || tx.total > 0)
        .map(tx => {
          if (tx.tipo === 'Ingreso') {
            const clientKey = tx.cliente?.toLowerCase().trim();
            if (tx.concepto === 'Total' || (tx.concepto === 'Seña' && clientsWithTotal.has(clientKey))) {
              tx.etapa = 'Completado';
              tx.estado = 'Completado';
            } else {
              tx.etapa = 'Máquina/Producción';
              tx.estado = 'Pendiente';
            }
          }
          return tx;
        });

      if (finalProcessed.length === 0) throw new Error("No se encontraron datos válidos. Verifica que los títulos de las columnas coincidan.");

      setImportPreview(finalProcessed);
      setImportStatus(`Se detectaron ${finalProcessed.length} registros. Revisa la vista previa abajo.`);
    } catch (e: any) {
      setImportStatus(`Error al procesar: ${e.message}`);
    }
  };

  const handleConfirmImport = () => {
    if (importPreview.length === 0) return;
    onImport(importPreview);
    setImportStatus(`Éxito: ${importPreview.length} registros importados.`);
    setImportPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end"><div><h2 className="text-3xl font-bold text-slate-800 tracking-tight">Configuración</h2></div><button onClick={onSync} disabled={isSyncing} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg">{isSyncing ? '...' : 'Refrescar Datos'}</button></header>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <ConfigTab label="Base de Datos" active={activeConfigTab === 'db'} onClick={() => setActiveConfigTab('db')} />
        <ConfigTab label="Importar" active={activeConfigTab === 'importar'} onClick={() => setActiveConfigTab('importar')} />
        <ConfigTab label="Proveedores" active={activeConfigTab === 'proveedores'} onClick={() => setActiveConfigTab('proveedores')} />
        <ConfigTab label="Pagos" active={activeConfigTab === 'pagos'} onClick={() => setActiveConfigTab('pagos')} />
        <ConfigTab label="Vendedores" active={activeConfigTab === 'vendedores'} onClick={() => setActiveConfigTab('vendedores')} />
        <ConfigTab label="Categorías" active={activeConfigTab === 'categorias'} onClick={() => setActiveConfigTab('categorias')} />
      </div>
      <div className="space-y-6">
        {activeConfigTab === 'db' && (
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="font-bold mb-4">Gestión de Datos</h3>
              <p className="text-slate-500 text-sm mb-6">Tus datos están almacenados de forma segura en el servidor local. Puedes descargar un respaldo completo en formato JSON para mayor seguridad.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={onDownloadBackup} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" /> Descargar Respaldo (JSON)
                </button>
                {showClearConfirm ? (
                  <div className="flex-1 flex gap-2">
                    <button onClick={() => { onClear(); setShowClearConfirm(false); }} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all">
                      Confirmar Borrado
                    </button>
                    <button onClick={() => setShowClearConfirm(false)} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowClearConfirm(true)} className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all">
                    Limpiar Base de Datos
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {activeConfigTab === 'importar' && (
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold">Importar Base de Datos (CSV)</h3>
                  <p className="text-slate-500 text-xs">
                    Sube el archivo CSV exportado de Google Sheets. El sistema detectará automáticamente las columnas.
                  </p>
                </div>
                {showImportClearConfirm ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { onClear(); setShowImportClearConfirm(false); }}
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-rose-700 transition-all"
                    >
                      Confirmar
                    </button>
                    <button 
                      onClick={() => setShowImportClearConfirm(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowImportClearConfirm(true)}
                    className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase hover:bg-rose-100 transition-all"
                  >
                    Limpiar Base Actual
                  </button>
                )}
              </div>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-12 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative group" onClick={() => fileInputRef.current?.click()}>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.txt"
                  className="hidden"
                />
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Database className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="font-bold text-slate-800">Haz clic para seleccionar el archivo CSV</p>
                <p className="text-xs text-slate-400 mt-2">Formato esperado: MM/DD/YYYY para fechas</p>
              </div>
              
              <div className="mt-6 flex gap-4">
                {importPreview.length > 0 && (
                  <button 
                    onClick={handleConfirmImport}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all animate-in zoom-in duration-300"
                  >
                    Confirmar Importación ({importPreview.length} registros)
                  </button>
                )}
              </div>
              
              {importStatus && (
                <p className={`mt-4 text-sm font-bold ${importStatus.startsWith('Error') ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {importStatus}
                </p>
              )}

              {importPreview.length > 0 && (
                <div className="mt-8 overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-slate-50 font-black uppercase text-slate-400">
                      <tr>
                        <th className="p-3">OT</th>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {importPreview.slice(0, 10).map((tx, i) => (
                        <tr key={i}>
                          <td className="p-3 font-bold">{tx.numeroOrden}</td>
                          <td className="p-3">{tx.fecha}</td>
                          <td className="p-3">{tx.cliente}</td>
                          <td className="p-3">{tx.sku}</td>
                          <td className="p-3 font-black">${tx.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 10 && (
                    <div className="p-3 text-center bg-slate-50 text-slate-400 italic">
                      Y {importPreview.length - 10} registros más...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {activeConfigTab === 'proveedores' && <ListManager title="Proveedores" list={config.suppliers} onUpdate={(newList) => onUpdateList('suppliers', newList)} placeholder="Nombre..." />}
        {activeConfigTab === 'pagos' && <ListManager title="Medios de Pago" list={config.paymentMethods} onUpdate={(newList) => onUpdateList('paymentMethods', newList)} placeholder="Nombre..." />}
        {activeConfigTab === 'vendedores' && <ListManager title="Vendedores" list={config.vendors} onUpdate={(newList) => onUpdateList('vendors', newList)} placeholder="Nombre..." />}
        {activeConfigTab === 'categorias' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ListManager title="Cuentas Ingreso" list={config.accountsIngresos} onUpdate={(newList) => onUpdateList('accountsIngresos', newList)} placeholder="..." />
            <ListManager title="Cuentas Egreso" list={config.accountsEgresos} onUpdate={(newList) => onUpdateList('accountsEgresos', newList)} placeholder="..." />
          </div>
        )}
      </div>
    </div>
  );
};

const NewProductModal: React.FC<{ onSave: (sku: string, name: string, stock: boolean) => void, onClose: () => void, products: any[] }> = ({ onSave, onClose, products }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const sku = (formData.get('newSku') as string).toUpperCase().trim();
    if (products.some((p: any) => p.sku === sku)) return alert("Duplicado");
    onSave(sku, formData.get('newName') as string, formData.get('newControlStock') === 'on');
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm space-y-6">
        <h3 className="text-2xl font-bold">Registrar SKU</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required name="newSku" placeholder="Código SKU" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" />
          <input required name="newName" placeholder="Nombre" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" />
          <div className="flex items-center gap-3"><input type="checkbox" name="newControlStock" defaultChecked /> <span>¿Controlar stock?</span></div>
          <div className="flex gap-4 pt-4"><button type="button" onClick={onClose} className="flex-1 font-bold text-slate-400">Cerrar</button><button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold">Guardar</button></div>
        </form>
      </div>
    </div>
  );
};

const EditStockModal: React.FC<{ sku: string, currentQty: number, currentMin: number, onSave: (qty: number, min: number) => void, onClose: () => void }> = ({ sku, currentQty, currentMin, onSave, onClose }) => {
  const [qty, setQty] = useState(currentQty.toString());
  const [min, setMin] = useState(currentMin.toString());
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm space-y-8">
        <h3 className="text-xl font-bold text-center">{sku}</h3>
        <div className="space-y-4">
          <div className="space-y-1"><label className="text-[10px] font-black uppercase">Stock Actual</label><input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full text-4xl font-black p-4 bg-slate-50 rounded-2xl text-center" /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase">Minimo Alerta</label><input type="number" value={min} onChange={(e) => setMin(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-center font-bold" /></div>
        </div>
        <div className="flex gap-4"><button onClick={onClose} className="flex-1 font-bold text-slate-400">Cancelar</button><button onClick={() => onSave(parseInt(qty) || 0, parseInt(min) || 0)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold">Actualizar</button></div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, totalValue?: string, icon: React.ReactNode, color: string, subText?: string }> = ({ label, value, totalValue, icon, color, subText }) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50',
    rose: 'bg-rose-50',
    blue: 'bg-blue-50',
    indigo: 'bg-indigo-50',
    slate: 'bg-slate-50'
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all hover:translate-y-[-4px]">
      <div className="flex justify-between items-center">
        <span className="text-slate-500 text-[10px] font-black uppercase">{label}</span>
        <div className={`p-3 ${colorMap[color] || 'bg-slate-50'} rounded-2xl`}>{icon}</div>
      </div>
      <span className="text-3xl font-black text-slate-800 tracking-tighter">{value}</span>
      {totalValue && (
        <div className="text-[10px] font-bold text-slate-400">
          Total Acumulado: <span className="text-slate-600">{totalValue}</span>
        </div>
      )}
      {subText && <span className="text-[10px] font-bold text-slate-400 uppercase">{subText}</span>}
    </div>
  );
};

export default App;
