import { db } from './index';
import { companies, deals, transactionCategories, transactions, users } from './schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const MONTH_MAP: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

function parseAmount(val: string): number {
  if (!val) return 0;
  // Clean '$', '.', ',' etc.
  const clean = val.replace(/\$/g, '').replace(/,/g, '').trim();
  return parseFloat(clean) || 0;
}

function parseDateStr(val: string, month: number, year: number): string | null {
  if (!val || val.trim() === '') return null;
  const parts = val.split('/');
  if (parts.length === 3) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2].length === 2 ? '20' + parts[2] : parts[2];
    return `${y}-${m}-${d}`;
  }
  return val;
}

async function run() {
  console.log('🚀 Iniciando proceso de importación...');

  // 1. Obtener usuario admin default para asignación
  const adminUser = await db.query.users.findFirst({ where: eq(users.role, 'admin') });
  const actorId = adminUser?.id;
  if (!actorId) {
    throw new Error('No se encontró ningún usuario administrador en la base de datos.');
  }

  // 2. Gestionar Categorías de Gastos
  const expenseCategories = [
    { name: 'Diseño', color: '#5CB2D4' },
    { name: 'Edición de video', color: '#EDA143' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of expenseCategories) {
    let existing = await db.query.transactionCategories.findFirst({
      where: eq(transactionCategories.name, cat.name),
    });
    if (!existing) {
      const [created] = await db
        .insert(transactionCategories)
        .values({
          name: cat.name,
          type: 'expense',
          color: cat.color,
        })
        .returning();
      existing = created;
    }
    categoryMap.set(cat.name.toLowerCase(), existing.id);
  }

  // 3. Gestionar Empresas y Deals
  const companyMap = new Map<string, string>();
  const dealMap = new Map<string, string>();

  const clientNameMapping: Record<string, string> = {
    'lubricentro': 'Lubricentro Pro Oil',
    'mc3 pres.': 'MC3',
    'mc3 ads': 'MC3',
    'olney': 'Olney 4x4 Parts',
    'olney 4x4 parts': 'Olney 4x4 Parts',
    'pierino': 'Pierino',
    'oveja negra': 'Oveja Negra',
    'max shorton': 'Max Shorton',
    'ld baterías': 'LD Baterías',
    'ecoelectrónica': 'Ecoelectrónica',
    'eco donato': 'Eco Donato',
  };

  // Crear o vincular empresas
  for (const rawName of Object.keys(clientNameMapping)) {
    const targetName = clientNameMapping[rawName];
    if (companyMap.has(targetName)) continue;

    let existing = await db.query.companies.findFirst({
      where: eq(companies.name, targetName),
    });

    if (!existing) {
      const [created] = await db
        .insert(companies)
        .values({
          name: targetName,
          clientStatus: 'active',
          ownerId: actorId,
        })
        .returning();
      existing = created;
      console.log(`✅ Creada empresa: ${targetName}`);
    } else {
      console.log(`ℹ️ Empresa existente encontrada: ${targetName}`);
    }

    companyMap.set(targetName, existing.id);
  }

  // Crear oportunidades (deals/retainers) para MC3
  const mc3Id = companyMap.get('MC3');
  const defaultStage = await db.query.pipelineStages.findFirst();
  const stageId = defaultStage?.id;

  if (mc3Id && stageId) {
    // Deal Presencial / Presupuestos
    let presDeal = await db.query.deals.findFirst({
      where: eq(deals.title, 'MC3 - Recepción de Presupuestos'),
    });
    if (!presDeal) {
      const [created] = await db
        .insert(deals)
        .values({
          title: 'MC3 - Recepción de Presupuestos',
          companyId: mc3Id,
          stageId,
          dealType: 'retainer',
          monthlyValue: 90000,
          ownerId: actorId,
        })
        .returning();
      presDeal = created;
    }
    dealMap.set('mc3 pres.', presDeal.id);

    // Deal Ads
    let adsDeal = await db.query.deals.findFirst({
      where: eq(deals.title, 'MC3 - Servicio Ads'),
    });
    if (!adsDeal) {
      const [created] = await db
        .insert(deals)
        .values({
          title: 'MC3 - Servicio Ads',
          companyId: mc3Id,
          stageId,
          dealType: 'retainer',
          monthlyValue: 300000,
          ownerId: actorId,
        })
        .returning();
      adsDeal = created;
    }
    dealMap.set('mc3 ads', adsDeal.id);
  }

  // 4. Importar Cobros v.2
  const cobrosRaw = fs.readFileSync('sheet_Cobros_v_2.csv', 'utf8');
  const cobrosLines = cobrosRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const cobrosData = cobrosLines.slice(1).map(parseCsvLine);

  console.log(`\n📥 Procesando ${cobrosData.length} registros de Cobros...`);
  let cobrosCount = 0;

  for (const row of cobrosData) {
    const [clienteRaw, mesRaw, anioRaw, fechaPagoRaw, montoRaw, estadoPagoRaw, estadoFactRaw, obsRaw] = row;
    if (!clienteRaw || !mesRaw) continue;

    const normalizedRawName = clienteRaw.toLowerCase().trim();
    const targetCompanyName = clientNameMapping[normalizedRawName] || clienteRaw;
    const companyId = companyMap.get(targetCompanyName);
    const dealId = dealMap.get(normalizedRawName) || null;

    const month = MONTH_MAP[mesRaw.toLowerCase().trim()] || null;
    const year = parseInt(anioRaw) || 2025;
    const amount = parseAmount(montoRaw);

    let status: 'paid' | 'pending' | 'cancelled' = 'pending';
    const estLower = (estadoPagoRaw || '').toLowerCase().trim();
    if (estLower === 'pagado') status = 'paid';
    else if (estLower === 'suspendido') status = 'cancelled';

    const billingStatus: 'billed' | 'unbilled' = (estadoFactRaw || '').toLowerCase().trim() === 'facturado' ? 'billed' : 'unbilled';
    const date = parseDateStr(fechaPagoRaw, month || 1, year);

    let notes = obsRaw ? obsRaw.trim() : null;
    if (normalizedRawName === 'mc3 pres.') {
      notes = notes ? `[Recepción de Presupuestos] ${notes}` : '[Recepción de Presupuestos]';
    } else if (normalizedRawName === 'mc3 ads') {
      notes = notes ? `[Servicio Ads] ${notes}` : '[Servicio Ads]';
    }

    await db.insert(transactions).values({
      type: 'income',
      amount,
      paidAmount: status === 'paid' ? amount : null,
      date,
      periodMonth: month,
      periodYear: year,
      status,
      billingStatus,
      notes,
      companyId,
      dealId,
    });

    cobrosCount++;
  }

  console.log(`✅ ${cobrosCount} Cobros insertados con éxito.`);

  // 5. Importar Pagos (Egresos)
  const pagosRaw = fs.readFileSync('sheet_Pagos.csv', 'utf8');
  const pagosLines = pagosRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const pagosData = pagosLines.slice(1).map(parseCsvLine);

  console.log(`\n📤 Procesando ${pagosData.length} registros de Pagos/Egresos...`);
  let pagosCount = 0;

  for (const row of pagosData) {
    const [empleadoGasto, fechaRaw, mesRaw, anioRaw, montoRaw, categoriaRaw, estadoRaw, notasRaw] = row;
    if (!empleadoGasto || !montoRaw) continue;

    const month = MONTH_MAP[(mesRaw || '').toLowerCase().trim()] || null;
    const year = parseInt(anioRaw) || 2025;
    const amount = parseAmount(montoRaw);
    const date = parseDateStr(fechaRaw, month || 1, year);

    const catKey = (categoriaRaw || '').toLowerCase().trim();
    const categoryId = categoryMap.get(catKey) || null;

    let notes = `[${empleadoGasto}]`;
    if (notasRaw && notasRaw.trim()) {
      notes += ` ${notasRaw.trim()}`;
    }

    await db.insert(transactions).values({
      type: 'expense',
      amount,
      paidAmount: amount,
      date,
      periodMonth: month,
      periodYear: year,
      status: 'paid',
      billingStatus: 'unbilled',
      notes,
      categoryId,
    });

    pagosCount++;
  }

  console.log(`✅ ${pagosCount} Pagos insertados con éxito.`);
  console.log('\n🎉 ¡Importación completada satisfactoriamente!');
}

run().catch((err) => {
  console.error('❌ Error en la importación:', err);
  process.exit(1);
});
