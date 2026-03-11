
import { 
  TransactionType, AccountType, ImputableType, SKUCode, 
  ConceptoType, EstadoType, PaymentMethodType, SupplierType, VendorType, EtapaProduccion 
} from './types';

export const TRANSACTION_TYPES: TransactionType[] = ['Ingreso', 'Egreso'];

export const ACCOUNTS_INGRESOS: AccountType[] = [
  'Ventas', 'Otros Ingresos'
];

export const ACCOUNTS_EGRESOS: AccountType[] = [
  'Costos Operativos', 'Costos No Operativos', 'Servicios', 'Impuestos'
];

export const ACCOUNTS: AccountType[] = [...ACCOUNTS_INGRESOS, ...ACCOUNTS_EGRESOS];

export const IMPUTABLES_INGRESOS: ImputableType[] = [
  'Venta Fábrica', 'Ventas LaserBeam', 'Otros Ingresos'
];

export const IMPUTABLES_EGRESOS: ImputableType[] = [
  'Materia Prima LaserBeam', 'Materia Prima Fábrica', 'Servicios/Suscrip.', 'Viáticos', 
  'Contador', 'Sueldos', 'Publicidad', 'Consumibles', 'Ajuste Cuentas', 'Infra Estructura', 
  'Monotributo Julian', 'Monotributo Carla', 'Monotributo Edith', 'Impuestos Municipales', 
  'Tienda Online', 'Logística', 'Reserva Taller', 'Otros Egresos'
];

export const IMPUTABLES: ImputableType[] = [...IMPUTABLES_INGRESOS, ...IMPUTABLES_EGRESOS];

export const SKUS: Record<SKUCode, string> = {
  'VF1000CC': 'Vaso de aluminio de 1000cc litro',
  'VF700CC': 'Vaso de aluminio de 700cc litro',
  'VF500CC': 'Vaso de aluminio de 500cc litro',
  'VT550CC': 'Vaso de aluminio de 550cc litro',
  'MATS': 'Mate tipo Stanley',
  'MATV': 'Mate tipo Vasito',
  'BOMB01': 'Bombilla plana',
  'LLAV01': 'Llavero destapador de aluminio',
  'CVF1000': 'Caja Vaso fernetero 1000cc',
  'CVF700': 'Caja Vaso fernetero 700cc',
  'SERVICIO': 'Servicio de Grabado/Corte',
  'OTROS': 'Otro Producto'
};

export const CONCEPTOS: ConceptoType[] = ['Seña', 'Saldo', 'Total'];

export const ESTADOS: EstadoType[] = ['Pendiente', 'Completado', 'Cancelado'];

export const ETAPAS_PRODUCCION: EtapaProduccion[] = [
  'Diseño Solicitado',
  'Pedido Potencial',
  'Pedido Confirmado',
  'Máquina/Producción',
  'Logística',
  'Completado'
];

export const PAYMENT_METHODS: PaymentMethodType[] = [
  'Efectivo', 'Mercado Pago Laserbeam', 'Mercado Pago Laserbeam2', 'Pendiente Cobro'
];

export const SUPPLIERS: SupplierType[] = [
  'ChatGPT', 'Google Workspace', 'Creative Fabrica', 'Canva', 'Claro Telefonia',
  'Movistar Telefonia', 'Internet', 'Edenor', 'Licencias', 'ARCA', 'TiendaNube',
  'Facebook', 'Mercado Libre', 'Varios', 'Trello', 'Correo/Envios', 'Limpieza'
];

export const VENDORS: VendorType[] = ['Julian', 'Elias', 'German'];

export const MEDIOS_ENVIO = [
  'A definir / Pendiente', 'Expreso', 'Correo Argentino', 'Andreani', 'Via Cargo', 'Uber entregas', 'Retiro en Taller'
];
