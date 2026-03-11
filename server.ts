import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";

const DATA_FILE = path.join(process.cwd(), "data.json");

// Initial data structure
const initialData = {
  transactions: [],
  products: [
    { sku: 'VF1000CC', nombre: 'Vaso de aluminio de 1000cc litro', controlaStock: true },
    { sku: 'VF700CC', nombre: 'Vaso de aluminio de 700cc litro', controlaStock: true },
    { sku: 'VF500CC', nombre: 'Vaso de aluminio de 500cc litro', controlaStock: true },
    { sku: 'VT550CC', nombre: 'Vaso de aluminio de 550cc litro', controlaStock: true },
    { sku: 'MATS', nombre: 'Mate tipo Stanley', controlaStock: true },
    { sku: 'MATV', nombre: 'Mate tipo Vasito', controlaStock: true },
    { sku: 'BOMB01', nombre: 'Bombilla plana', controlaStock: true },
    { sku: 'LLAV01', nombre: 'Llavero destapador de aluminio', controlaStock: true },
    { sku: 'CVF1000', nombre: 'Caja Vaso fernetero 1000cc', controlaStock: false },
    { sku: 'CVF700', nombre: 'Caja Vaso fernetero 700cc', controlaStock: false },
    { sku: 'SERVICIO', nombre: 'Servicio de Grabado/Corte', controlaStock: false },
    { sku: 'OTROS', nombre: 'Otro Producto', controlaStock: false }
  ],
  stocks: [
    { sku: 'VF1000CC', nombre: 'Vaso de aluminio de 1000cc litro', cantidad: 0, minStock: 10 },
    { sku: 'VF700CC', nombre: 'Vaso de aluminio de 700cc litro', cantidad: 0, minStock: 10 },
    { sku: 'VF500CC', nombre: 'Vaso de aluminio de 500cc litro', cantidad: 0, minStock: 10 },
    { sku: 'VT550CC', nombre: 'Vaso de aluminio de 550cc litro', cantidad: 0, minStock: 10 },
    { sku: 'MATS', nombre: 'Mate tipo Stanley', cantidad: 0, minStock: 10 },
    { sku: 'MATV', nombre: 'Mate tipo Vasito', cantidad: 0, minStock: 10 },
    { sku: 'BOMB01', nombre: 'Bombilla plana', cantidad: 0, minStock: 10 },
    { sku: 'LLAV01', nombre: 'Llavero destapador de aluminio', cantidad: 0, minStock: 10 }
  ],
  config: {
    sheetUrl: '', // Not used anymore but kept for compatibility
    suppliers: [
      'ChatGPT', 'Google Workspace', 'Creative Fabrica', 'Canva', 'Claro Telefonia',
      'Movistar Telefonia', 'Internet', 'Edenor', 'Licencias', 'ARCA', 'TiendaNube',
      'Facebook', 'Mercado Libre', 'Varios', 'Trello', 'Correo/Envios', 'Limpieza'
    ],
    paymentMethods: [
      'Efectivo', 'Mercado Pago Laserbeam', 'Mercado Pago Laserbeam2', 'Pendiente Cobro'
    ],
    vendors: ['Julian', 'Elias', 'German'],
    accountsIngresos: ['Ventas', 'Otros Ingresos'],
    accountsEgresos: ['Costos Operativos', 'Costos No Operativos', 'Servicios', 'Impuestos'],
    imputablesIngresos: ['Venta Fábrica', 'Ventas LaserBeam', 'Otros Ingresos'],
    imputablesEgresos: [
      'Materia Prima LaserBeam', 'Materia Prima Fábrica', 'Servicios/Suscrip.', 'Viáticos', 
      'Contador', 'Sueldos', 'Publicidad', 'Consumibles', 'Ajuste Cuentas', 'Infra Estructura', 
      'Monotributo Julian', 'Monotributo Carla', 'Monotributo Edith', 'Impuestos Municipales', 
      'Tienda Online', 'Logística', 'Reserva Taller', 'Otros Egresos'
    ]
  }
};

// Helper to read data
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.error("Error reading data file, resetting to initial", e);
    return initialData;
  }
}

// Helper to write data
function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // API Routes
  app.get("/api/data", (req, res) => {
    const data = readData();
    res.json(data);
  });

  app.post("/api/updateTransaction", (req, res) => {
    const tx = req.body;
    if (!tx || !tx.id) return res.status(400).json({ status: 'error', message: 'ID missing' });

    const data = readData();
    const index = data.transactions.findIndex((t: any) => t.id === tx.id);
    
    if (index >= 0) {
      data.transactions[index] = { ...data.transactions[index], ...tx };
    } else {
      data.transactions.push(tx);
    }
    
    writeData(data);
    res.json({ status: 'ok', message: 'Transaction updated' });
  });

  app.post("/api/deleteTransaction", (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ status: 'error', message: 'ID missing' });

    const data = readData();
    data.transactions = data.transactions.filter((t: any) => t.id !== id);
    
    writeData(data);
    res.json({ status: 'ok', message: 'Transaction deleted' });
  });

  app.post("/api/updateStock", (req, res) => {
    const { sku, cantidad, minStock } = req.body;
    const data = readData();
    const index = data.stocks.findIndex((s: any) => s.sku === sku);
    
    if (index >= 0) {
      if (cantidad !== undefined) data.stocks[index].cantidad = cantidad;
      if (minStock !== undefined) data.stocks[index].minStock = minStock;
    } else {
      // If product exists but not in stocks, add it
      const prod = data.products.find((p: any) => p.sku === sku);
      if (prod) {
        data.stocks.push({ sku, nombre: prod.nombre, cantidad: cantidad || 0, minStock: minStock || 0 });
      }
    }
    
    writeData(data);
    res.json({ status: 'ok', message: 'Stock updated' });
  });

  app.post("/api/addProduct", (req, res) => {
    const product = req.body;
    const data = readData();
    
    if (data.products.some((p: any) => p.sku === product.sku)) {
      return res.status(400).json({ status: 'error', message: 'SKU already exists' });
    }
    
    data.products.push(product);
    if (product.controlaStock) {
      data.stocks.push({ sku: product.sku, nombre: product.nombre, cantidad: 0, minStock: 0 });
    }
    
    writeData(data);
    res.json({ status: 'ok', message: 'Product added' });
  });

  app.post("/api/updateConfig", (req, res) => {
    const newConfig = req.body;
    const data = readData();
    data.config = { ...data.config, ...newConfig };
    writeData(data);
    res.json({ status: 'ok', message: 'Config updated' });
  });

  app.get("/api/backup", (req, res) => {
    const data = readData();
    res.setHeader('Content-disposition', 'attachment; filename=laserbeam_backup.json');
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
