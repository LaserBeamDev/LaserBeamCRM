
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Transaction, PaymentMethodType, EtapaProduccion } from '../types';

interface MercadoPagoImporterProps {
  onImport: (transactions: Transaction[]) => void;
  onClose: () => void;
  paymentMethods: string[];
}

const MercadoPagoImporter: React.FC<MercadoPagoImporterProps> = ({ onImport, onClose, paymentMethods }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>(paymentMethods.find(m => m.includes('Mercado Pago')) || paymentMethods[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const processCsv = () => {
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      // Find the header line
      const headerIndex = lines.findIndex(line => 
        (line.includes('RELEASE_DATE') || line.includes('fecha_liberacion')) && 
        (line.includes('TRANSACTION_NET_AMOUNT') || line.includes('monto_neto_transaccion'))
      );

      if (headerIndex === -1) {
        setError('No se encontró la cabecera de transacciones. Verifique que el reporte sea el correcto.');
        setIsProcessing(false);
        return;
      }

      const csvData = lines.slice(headerIndex).join('\n');

      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          try {
            const rawData = results.data as any[];
            
            const mappedTransactions: Transaction[] = rawData
              .filter(row => {
                const desc = (row.TRANSACTION_TYPE || row.tipo_transaccion || row.DESCRIPTION || row.descripcion || '').toLowerCase();
                const keywords = [
                  'facebook', 'micorreo', 'zilver sa', 'mercado libre', 'mercadolibre',
                  'tiendanube', 'creativefabrica', 'claro deb aut', 'movistar', 'openai', 'chatgpt',
                  'arca', 'trello', 'andreani'
                ];
                return (row.RELEASE_DATE || row.fecha_liberacion) && 
                       (row.TRANSACTION_NET_AMOUNT || row.monto_neto_transaccion) &&
                       keywords.some(k => desc.includes(k));
              })
              .map((row, index) => {
                const rawAmount = row.TRANSACTION_NET_AMOUNT || row.monto_neto_transaccion || '0';
                const amountStr = String(rawAmount).trim();
                let amount = 0;
                if (amountStr.includes(',') && amountStr.includes('.')) {
                  // AR format: 1.234,56
                  amount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
                } else if (amountStr.includes(',')) {
                  // Check if it's decimal or thousands
                  const parts = amountStr.split(',');
                  if (parts[parts.length - 1].length === 2) {
                    amount = parseFloat(amountStr.replace(',', '.'));
                  } else {
                    amount = parseFloat(amountStr.replace(',', ''));
                  }
                } else {
                  amount = parseFloat(amountStr);
                }

                const isIncome = amount > 0;
                const type = isIncome ? 'Ingreso' : 'Egreso';
                const description = row.TRANSACTION_TYPE || row.tipo_transaccion || row.DESCRIPTION || row.descripcion || '';
                
                let cuenta: any = 'Costos Operativos';
                let imputable: any = 'Otros Egresos';
                let proveedor = 'Varios';
                let cliente = '';
                let detalle = description;

                const descLower = description.toLowerCase();

                if (descLower.includes('facebook')) {
                  cuenta = 'Costos Operativos';
                  imputable = 'Publicidad';
                  proveedor = 'Facebook';
                } else if (descLower.includes('micorreo')) {
                  cuenta = 'Costos Operativos';
                  imputable = 'Logística';
                  proveedor = 'Correo/Envios';
                } else if (descLower.includes('zilver sa')) {
                  cuenta = 'Servicios';
                  imputable = 'Servicios/Suscrip.';
                  proveedor = 'Canva';
                } else if (descLower.includes('mercado libre') || descLower.includes('mercadolibre')) {
                  cuenta = 'Impuestos';
                  imputable = 'Tienda Online';
                  proveedor = 'Mercado Libre';
                } else if (descLower.includes('tiendanube')) {
                  cuenta = 'Servicios';
                  imputable = 'Tienda Online';
                  proveedor = 'TiendaNube';
                } else if (descLower.includes('creativefabrica')) {
                  cuenta = 'Servicios';
                  imputable = 'Servicios/Suscrip.';
                  proveedor = 'Creative Fabrica';
                } else if (descLower.includes('claro deb aut')) {
                  cuenta = 'Servicios';
                  imputable = 'Servicios/Suscrip.';
                  proveedor = 'Claro Telefonia';
                } else if (descLower.includes('movistar')) {
                  cuenta = 'Servicios';
                  imputable = 'Servicios/Suscrip.';
                  proveedor = 'Movistar Telefonia';
                } else if (descLower.includes('openai') || descLower.includes('chatgpt')) {
                  cuenta = 'Servicios';
                  imputable = 'Servicios/Suscrip.';
                  proveedor = 'ChatGPT';
                } else if (descLower.includes('arca')) {
                  cuenta = 'Impuestos';
                  imputable = 'Monotributo Julian';
                  proveedor = 'ARCA';
                } else if (descLower.includes('trello')) {
                  cuenta = 'Servicios';
                  imputable = 'Servicios/Suscrip.';
                  proveedor = 'Trello';
                } else if (descLower.includes('andreani')) {
                  cuenta = 'Costos Operativos';
                  imputable = 'Logística';
                  proveedor = 'Andreani';
                }

                const rawDate = (row.RELEASE_DATE || row.fecha_liberacion || '').split(' ')[0].trim();
                const dateParts = rawDate.split(/[\-\/]/);
                let formattedDate = rawDate;
                if (dateParts.length === 3) {
                  const v0 = dateParts[0];
                  const v1 = dateParts[1];
                  const v2 = dateParts[2];
                  if (v0.length === 4) {
                    formattedDate = `${v0}-${v1.padStart(2, '0')}-${v2.padStart(2, '0')}`;
                  } else {
                    // Mercado Pago report is DD/MM/YYYY
                    // v0 is Day, v1 is Month, v2 is Year
                    const year = v2.length === 2 ? '20' + v2 : v2;
                    formattedDate = `${year}-${v1.padStart(2, '0')}-${v0.padStart(2, '0')}`;
                  }
                }

                return {
                  id: `mp_${row.REFERENCE_ID || row.id_referencia || Date.now() + index}`,
                  fecha: formattedDate,
                  tipo: type,
                  cuenta,
                  imputable,
                  total: Math.abs(amount),
                  concepto: 'Total',
                  facturacion: Math.abs(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 }),
                  estado: isIncome ? 'Completado' : 'Pagado',
                  medioPago: selectedAccount as PaymentMethodType,
                  cliente,
                  proveedor,
                  vendedor: 'Julian',
                  detalle,
                  unidades: 1,
                  prioridad: Date.now() + index,
                  etapa: isIncome ? 'Completado' as EtapaProduccion : undefined,
                  numeroOrden: '',
                  sku: 'VARIOS'
                } as Transaction;
              });

            onImport(mappedTransactions);
            setIsProcessing(false);
          } catch (err: any) {
            console.error(err);
            setError('Error al procesar el archivo. Verifique el formato.');
            setIsProcessing(false);
          }
        },
        error: (err: any) => {
          setError(`Error: ${err.message}`);
          setIsProcessing(false);
        }
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl space-y-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Importar Mercado Pago</h2>
            <p className="text-slate-500 font-medium">Procesa reportes de entradas y salidas automáticamente</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cuenta de Destino</label>
            <select 
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div 
            className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer
              ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
            onClick={() => document.getElementById('mp-file-input')?.click()}
          >
            <input 
              id="mp-file-input"
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileChange}
            />
            {file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Seleccionar reporte CSV</p>
                  <p className="text-sm text-slate-500">Arrastra el archivo o haz clic para buscar</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 rounded-2xl flex items-center gap-3 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={processCsv}
              disabled={!file || isProcessing}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all
                ${!file || isProcessing 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Procesar e Importar
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Soporta reportes de Argentina (CSV) con columnas RELEASE_DATE y TRANSACTION_NET_AMOUNT
          </p>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoImporter;
