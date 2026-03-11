
export type TransactionType = 'Ingreso' | 'Egreso';

export type AccountType = string;
export type ImputableType = string;
export type SKUCode = string;
export type ConceptoType = 'Seña' | 'Saldo' | 'Total';
export type EstadoType = 'Pendiente' | 'Completado' | 'Cancelado';
export type EtapaProduccion = 'Diseño Solicitado' | 'Pedido Potencial' | 'Pedido Confirmado' | 'Máquina/Producción' | 'Logística' | 'Completado';
export type PaymentMethodType = string;
export type SupplierType = string;
export type VendorType = string;

export interface Product {
  sku: SKUCode;
  nombre: string;
  controlaStock: boolean;
}

export interface TransactionItem {
  sku: SKUCode;
  unidades: number;
}

export interface AppConfig {
  sheetUrl: string;
  suppliers: SupplierType[];
  paymentMethods: PaymentMethodType[];
  vendors: VendorType[];
  accountsIngresos: AccountType[];
  accountsEgresos: AccountType[];
  imputablesIngresos: ImputableType[];
  imputablesEgresos: ImputableType[];
}

export interface Transaction {
  id: string;
  numeroOrden: string;
  fecha: string;
  fechaEntrega?: string; // Nueva: Fecha pactada con el cliente
  prioridad?: number;    // Nueva: Orden visual en el Kanban
  tipo: TransactionType;
  cuenta: AccountType;
  imputable: ImputableType;
  sku: SKUCode;
  total: number;
  concepto: ConceptoType;
  estado: EstadoType;
  etapa?: EtapaProduccion;
  medioPago: PaymentMethodType;
  unidades: number;
  items?: TransactionItem[];
  proveedor?: SupplierType;
  cliente: string;
  vendedor: VendorType;
  detalle: string;
  notasProduccion?: string;
  medioEnvio?: string;
  trackingNumber?: string;
  fechaDespacho?: string;
}

export interface ProductStock {
  sku: SKUCode;
  nombre: string;
  cantidad: number;
  minStock: number;
}
