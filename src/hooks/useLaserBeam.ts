
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, ProductStock, SKUCode, Product, AppConfig, TransactionItem, EtapaProduccion } from '../types';
import { 
  SKUS, SUPPLIERS, PAYMENT_METHODS, VENDORS, 
  ACCOUNTS_INGRESOS, ACCOUNTS_EGRESOS, 
  IMPUTABLES_INGRESOS, IMPUTABLES_EGRESOS,
  ETAPAS_PRODUCCION
} from '../constants';

const INITIAL_PRODUCTS: Product[] = Object.entries(SKUS).map(([sku, nombre]) => ({
  sku,
  nombre,
  controlaStock: !['CVF1000', 'CVF700', 'SERVICIO', 'OTROS'].includes(sku)
}));

const isConfirmed = (etapa?: EtapaProduccion) => {
  if (!etapa) return true;
  const confirmedStages: EtapaProduccion[] = ['Pedido Confirmado', 'Máquina/Producción', 'Logística', 'Completado'];
  return confirmedStages.includes(etapa);
};

export const useLaserBeam = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [baseStocks, setBaseStocks] = useState<ProductStock[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [config, setConfig] = useState<AppConfig>({ 
    sheetUrl: '', // No longer used
    suppliers: SUPPLIERS,
    paymentMethods: PAYMENT_METHODS,
    vendors: VENDORS,
    accountsIngresos: ACCOUNTS_INGRESOS,
    accountsEgresos: ACCOUNTS_EGRESOS,
    imputablesIngresos: IMPUTABLES_INGRESOS,
    imputablesEgresos: IMPUTABLES_EGRESOS
  });

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
      setProducts(data.products || []);
      setBaseStocks(data.stocks || []);
      setConfig(data.config || config);
      return data;
    } catch (e: any) {
      console.error("Error al cargar datos del servidor:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncTransaction = useCallback(async (tx: Transaction) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/updateTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (e: any) {
      console.error("Error en sincronización:", e);
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  }, []);

  const deleteTransactionFromApi = useCallback(async (id: string) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/deleteTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (e: any) {
      console.error("Error al eliminar:", e);
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  }, []);

  const updateStockInApi = useCallback(async (sku: SKUCode, qty: number, min: number) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/updateStock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, cantidad: qty, minStock: min })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (e: any) {
      console.error("Error al actualizar stock:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const addProductToApi = useCallback(async (product: Product) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/addProduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (e: any) {
      console.error("Error al añadir producto:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateConfigInApi = useCallback(async (newConfig: Partial<AppConfig>) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/updateConfig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (e: any) {
      console.error("Error al actualizar config:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const downloadBackup = useCallback(() => {
    window.location.href = '/api/backup';
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentStocks = useMemo(() => {
    const stockMap = new Map<SKUCode, { cantidad: number, minStock: number }>(
      baseStocks.map(s => [s.sku, { cantidad: s.cantidad, minStock: s.minStock }])
    );
    
    products.filter(p => p.controlaStock).forEach(p => {
      if (!stockMap.has(p.sku)) stockMap.set(p.sku, { cantidad: 0, minStock: 10 });
    });

    transactions.forEach(tx => {
      if (tx.tipo === 'Ingreso' && tx.estado !== 'Cancelado' && isConfirmed(tx.etapa)) {
        const itemsToProcess: TransactionItem[] = tx.items && tx.items.length > 0 
          ? tx.items 
          : [{ sku: tx.sku, unidades: tx.unidades }];

        itemsToProcess.forEach(item => {
          const currentData = stockMap.get(item.sku);
          if (currentData) {
            stockMap.set(item.sku, { 
              ...currentData, 
              cantidad: currentData.cantidad - (item.unidades || 0) 
            });
          }
        });
      }
    });

    return Array.from(stockMap.entries()).map(([sku, data]) => ({
      sku,
      nombre: products.find(p => p.sku === sku)?.nombre || sku,
      cantidad: data.cantidad,
      minStock: data.minStock
    })).filter(s => products.find(p => p.sku === s.sku && p.controlaStock));
  }, [transactions, baseStocks, products]);

  const stats = useMemo(() => {
    const incomeRaw = transactions
      .filter(t => t.tipo === 'Ingreso' && t.estado !== 'Cancelado' && isConfirmed(t.etapa))
      .reduce((acc, curr) => acc + curr.total, 0);
    
    const expenseRaw = transactions
      .filter(t => t.tipo === 'Egreso' && t.estado !== 'Cancelado')
      .reduce((acc, curr) => acc + curr.total, 0);

    const income = Math.round(incomeRaw * 100) / 100;
    const expense = Math.round(expenseRaw * 100) / 100;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dailyIncomeRaw = transactions
        .filter(t => t.tipo === 'Ingreso' && t.fecha === dateStr && t.estado !== 'Cancelado' && isConfirmed(t.etapa))
        .reduce((acc, curr) => acc + curr.total, 0);
      return { name: dateStr.slice(-5), income: Math.round(dailyIncomeRaw * 100) / 100 };
    });

    return { 
      income, expense, balance: Math.round((income - expense) * 100) / 100, 
      lowStockItems: currentStocks.filter(s => s.cantidad <= s.minStock),
      last7Days,
      monthlySales: [],
      margin: income > 0 ? ((income - expense) / income) * 100 : 0
    };
  }, [transactions, currentStocks]);

  const addTransaction = useCallback(async (newTx: Transaction) => {
    const txWithEtapa = { 
      ...newTx, 
      prioridad: newTx.prioridad || Date.now(),
      etapa: newTx.etapa || (newTx.tipo === 'Ingreso' ? 'Pedido Confirmado' as EtapaProduccion : undefined) 
    };
    setTransactions(prev => [txWithEtapa, ...prev]);
    await syncTransaction(txWithEtapa);
  }, [syncTransaction]);

  const updateTransaction = useCallback(async (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
    await syncTransaction(updatedTx);
  }, [syncTransaction]);

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    await deleteTransactionFromApi(id);
  }, [deleteTransactionFromApi]);

  const updateTransactionEtapa = useCallback(async (id: string, etapa: EtapaProduccion) => {
    setTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      if (tx) {
        const updated = { ...tx, etapa, prioridad: Date.now() };
        setTimeout(() => syncTransaction(updated), 0);
        return prev.map(t => t.id === id ? updated : t);
      }
      return prev;
    });
  }, [syncTransaction]);

  const reorderTransactions = useCallback((newOrder: Transaction[]) => {
    setTransactions(prev => {
      const otherTransactions = prev.filter(t => !newOrder.find(no => no.id === t.id));
      return [...newOrder, ...otherTransactions];
    });
  }, []);

  const addProduct = useCallback(async (sku: string, nombre: string, controlaStock: boolean) => {
    const newProduct: Product = { sku, nombre, controlaStock };
    setProducts(prev => [...prev, newProduct]);
    if (controlaStock) {
      setBaseStocks(prev => [...prev, { sku, nombre, cantidad: 0, minStock: 10 }]);
    }
    await addProductToApi(newProduct);
  }, [addProductToApi]);

  const updateConfigList = useCallback(async (key: keyof Omit<AppConfig, 'sheetUrl'>, newList: string[]) => {
    const newConfig = { ...config, [key]: newList };
    setConfig(newConfig);
    await updateConfigInApi(newConfig);
  }, [config, updateConfigInApi]);

  return {
    transactions, products, currentStocks, stats, config, isSyncing,
    addTransaction, updateTransaction, deleteTransaction, updateTransactionEtapa, reorderTransactions,
    updateBaseStock: async (sku: SKUCode, qty: number, min: number) => {
      setBaseStocks(prev => {
        const exists = prev.find(s => s.sku === sku);
        if (exists) return prev.map(s => s.sku === sku ? { ...s, cantidad: qty, minStock: min } : s);
        return [...prev, { sku: sku, nombre: products.find(p => p.sku === sku)?.nombre || sku, cantidad: qty, minStock: min }];
      });
      await updateStockInApi(sku, qty, min);
    }, 
    addProduct, setConfig: async (c: AppConfig) => {
      setConfig(c);
      await updateConfigInApi(c);
    }, 
    updateConfigList, 
    fetchFromCloud: fetchData, 
    testConnection: async () => ({ success: true, message: 'Conectado al servidor local' }),
    initializeCloud: async () => ({ success: true, message: 'Base de datos local activa' }),
    downloadBackup
  };
};
