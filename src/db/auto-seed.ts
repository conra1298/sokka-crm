import { db } from './index';
import { users } from './schema';
import { ensureSchemaExists } from './schema-init';
import bcrypt from 'bcryptjs';
import {
  companies,
  contacts,
  pipelineStages,
  deals,
  activities,
  tasks,
} from './schema';

let isSeeding = false;

export async function ensureDatabaseReady() {
  try {
    await ensureSchemaExists();

    const existingUser = await db.query.users.findFirst();
    if (!existingUser && !isSeeding) {
      isSeeding = true;
      console.log('🌱 Base de datos vacía detectada. Poblando esquema y datos semilla automáticamente...');

      const passwordHash = await bcrypt.hash('sokka2024', 10);
      const [adminUser] = await db
        .insert(users)
        .values({
          email: 'admin@sokka.com',
          name: 'Carlos Mendoza (Admin)',
          passwordHash,
          role: 'admin',
        })
        .returning();

      const [managerUser] = await db
        .insert(users)
        .values({
          email: 'manager@sokka.com',
          name: 'Laura Fernández (Gerente)',
          passwordHash,
          role: 'manager',
        })
        .returning();

      const [salesUser] = await db
        .insert(users)
        .values({
          email: 'sales@sokka.com',
          name: 'Mateo Rossi (Vendedor)',
          passwordHash,
          role: 'salesperson',
        })
        .returning();

      const stagesData = [
        { name: 'Prospecto Identificado', displayOrder: 1, isWon: false, isTerminal: false },
        { name: 'Contacto Calificado', displayOrder: 2, isWon: false, isTerminal: false },
        { name: 'Propuesta Presentada', displayOrder: 3, isWon: false, isTerminal: false },
        { name: 'Negociación Final', displayOrder: 4, isWon: false, isTerminal: false },
        { name: 'Cerrada Ganada', displayOrder: 5, isWon: true, isTerminal: true },
        { name: 'Cerrada Perdida', displayOrder: 6, isWon: false, isTerminal: true },
      ];

      const createdStages = await db.insert(pipelineStages).values(stagesData).returning();
      const stageMap = new Map(createdStages.map((s: any) => [s.name, s.id]));

      const companiesData = [
        { name: 'Tech Latam S.A.', domain: 'techlatam.com', industry: 'Software B2B', ownerId: salesUser.id },
        { name: 'Innovación Digital Corp', domain: 'innovacioncorp.com', industry: 'Consultoría', ownerId: salesUser.id },
        { name: 'Sistemas Andinos', domain: 'sistemasandinos.co', industry: 'Telecomunicaciones', ownerId: managerUser.id },
        { name: 'Logística Global S.R.L.', domain: 'logisticaglobal.net', industry: 'Logística', ownerId: salesUser.id },
        { name: 'Finanzas del Sur', domain: 'finanzasdelsur.com', industry: 'Fintech', ownerId: adminUser.id },
      ];

      const createdCompanies = await db.insert(companies).values(companiesData).returning();
      const companyMap = new Map(createdCompanies.map((c: any) => [c.name, c.id]));

      const contactsData = [
        {
          firstName: 'Sofía',
          lastName: 'Gómez',
          email: 'sofia.gomez@techlatam.com',
          normalizedEmail: 'sofia.gomez@techlatam.com',
          phone: '+54 11 4444 1111',
          jobTitle: 'Directora de Tecnología',
          companyId: companyMap.get('Tech Latam S.A.'),
          ownerId: salesUser.id,
          hasDuplicates: true,
          duplicateCount: 1,
        },
        {
          firstName: 'Sofia',
          lastName: 'Gomez (Duplicado)',
          email: 'sofia.gomez+ventas@techlatam.com',
          normalizedEmail: 'sofia.gomez@techlatam.com',
          phone: '+54 11 4444 1112',
          jobTitle: 'CTO',
          companyId: companyMap.get('Tech Latam S.A.'),
          ownerId: salesUser.id,
          hasDuplicates: true,
          duplicateCount: 1,
        },
        {
          firstName: 'Alejandro',
          lastName: 'Navarro',
          email: 'anavarro@innovacioncorp.com',
          normalizedEmail: 'anavarro@innovacioncorp.com',
          phone: '+34 91 555 2222',
          jobTitle: 'Gerente Comercial',
          companyId: companyMap.get('Innovación Digital Corp'),
          ownerId: salesUser.id,
        },
        {
          firstName: 'Valentina',
          lastName: 'Ríos',
          email: 'vrios@sistemasandinos.co',
          normalizedEmail: 'vrios@sistemasandinos.co',
          phone: '+57 1 333 4444',
          jobTitle: 'VP de Operaciones',
          companyId: companyMap.get('Sistemas Andinos'),
          ownerId: managerUser.id,
        },
        {
          firstName: 'Gonzalo',
          lastName: 'Pérez',
          email: 'gperez@logisticaglobal.net',
          normalizedEmail: 'gperez@logisticaglobal.net',
          phone: '+52 55 8888 7777',
          jobTitle: 'Director de Compras',
          companyId: companyMap.get('Logística Global S.R.L.'),
          ownerId: salesUser.id,
        },
      ];

      const createdContacts = await db.insert(contacts).values(contactsData).returning();
      const contactMap = new Map(createdContacts.map((c: any) => [c.email, c.id]));

      const today = new Date();
      const nextMonthStr = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const dealsData = [
        {
          title: 'Licencias Anuales Enterprise — Tech Latam',
          value: 28000.00,
          currency: 'USD',
          stageId: stageMap.get('Propuesta Presentada')!,
          companyId: companyMap.get('Tech Latam S.A.'),
          contactId: contactMap.get('sofia.gomez@techlatam.com'),
          ownerId: salesUser.id,
          expectedCloseDate: nextMonthStr,
        },
        {
          title: 'Consultoría en Transformación Digital — Innovación Corp',
          value: 45000.00,
          currency: 'USD',
          stageId: stageMap.get('Contacto Calificado')!,
          companyId: companyMap.get('Innovación Digital Corp'),
          contactId: contactMap.get('anavarro@innovacioncorp.com'),
          ownerId: salesUser.id,
          expectedCloseDate: nextMonthStr,
        },
        {
          title: 'Infraestructura de Redes — Sistemas Andinos',
          value: 75000.00,
          currency: 'USD',
          stageId: stageMap.get('Negociación Final')!,
          companyId: companyMap.get('Sistemas Andinos'),
          contactId: contactMap.get('vrios@sistemasandinos.co'),
          ownerId: managerUser.id,
          expectedCloseDate: nextMonthStr,
        },
        {
          title: 'Módulo de Monitoreo — Logística Global',
          value: 18500.00,
          currency: 'USD',
          stageId: stageMap.get('Cerrada Ganada')!,
          companyId: companyMap.get('Logística Global S.R.L.'),
          contactId: contactMap.get('gperez@logisticaglobal.net'),
          ownerId: salesUser.id,
          expectedCloseDate: null,
        },
      ];

      const createdDeals = await db.insert(deals).values(dealsData).returning();
      const dealMap = new Map(createdDeals.map((d: any) => [d.title, d.id]));

      const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const tasksData = [
        {
          title: 'Enviar propuesta técnica ajustada a Sofía Gómez',
          isCompleted: false,
          dueDate: yesterdayStr,
          assignedTo: salesUser.id,
          createdBy: salesUser.id,
          contactId: contactMap.get('sofia.gomez@techlatam.com'),
          dealId: dealMap.get('Licencias Anuales Enterprise — Tech Latam'),
        },
        {
          title: 'Llamada de demostración con Alejandro Navarro',
          isCompleted: false,
          dueDate: nextMonthStr,
          assignedTo: salesUser.id,
          createdBy: salesUser.id,
          contactId: contactMap.get('anavarro@innovacioncorp.com'),
          dealId: dealMap.get('Consultoría en Transformación Digital — Innovación Corp'),
        },
        {
          title: 'Revisar contrato legal con Valentina Ríos',
          isCompleted: false,
          dueDate: yesterdayStr,
          assignedTo: managerUser.id,
          createdBy: managerUser.id,
          contactId: contactMap.get('vrios@sistemasandinos.co'),
          dealId: dealMap.get('Infraestructura de Redes — Sistemas Andinos'),
        },
      ];

      await db.insert(tasks).values(tasksData);

      const activitiesData = [
        {
          type: 'note' as const,
          content: 'Reunión inicial de relevamiento de requerimientos finalizada con éxito.',
          dealId: dealMap.get('Licencias Anuales Enterprise — Tech Latam'),
          createdBy: salesUser.id,
        },
        {
          type: 'call' as const,
          content: 'Llamada telefónica de 20 min con Sofía Gómez. Confirmó presupuesto para Q3.',
          contactId: contactMap.get('sofia.gomez@techlatam.com'),
          createdBy: salesUser.id,
        },
        {
          type: 'stage_change' as const,
          content: 'Cambió la etapa de la oportunidad de "Contacto Calificado" a "Propuesta Presentada".',
          dealId: dealMap.get('Licencias Anuales Enterprise — Tech Latam'),
          createdBy: salesUser.id,
        },
      ];

      await db.insert(activities).values(activitiesData);
      console.log('🎉 ¡Base de datos e historial inicial cargados exitosamente!');
    }
  } catch (err) {
    console.error('Error al verificar readiness de la base de datos:', err);
  } finally {
    isSeeding = false;
  }
}
