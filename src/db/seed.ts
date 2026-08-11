import { db } from './index';
import {
  users,
  companies,
  contacts,
  pipelineStages,
  deals,
  activities,
  tasks,
  importJobs,
} from './schema';
import bcrypt from 'bcryptjs';

import { ensureSchemaExists } from './schema-init';

async function seed() {
  console.log('🌱 Iniciando población de datos iniciales en español...');

  // Ensure tables exist
  await ensureSchemaExists();

  // 1. Clear existing records cleanly
  await db.delete(tasks);
  await db.delete(activities);
  await db.delete(deals);
  await db.delete(contacts);
  await db.delete(companies);
  await db.delete(pipelineStages);
  await db.delete(importJobs);
  await db.delete(users);

  // 2. Users
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

  console.log('✅ Usuarios creados (Admin, Gerente, Vendedor)');

  // 3. Pipeline Stages
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
  console.log('✅ Etapas del pipeline creadas');

  // 4. Companies
  const companiesData = [
    { name: 'Tech Latam S.A.', domain: 'techlatam.com', industry: 'Software B2B', ownerId: salesUser.id },
    { name: 'Innovación Digital Corp', domain: 'innovacioncorp.com', industry: 'Consultoría', ownerId: salesUser.id },
    { name: 'Sistemas Andinos', domain: 'sistemasandinos.co', industry: 'Telecomunicaciones', ownerId: managerUser.id },
    { name: 'Logística Global S.R.L.', domain: 'logisticaglobal.net', industry: 'Logística', ownerId: salesUser.id },
    { name: 'Finanzas del Sur', domain: 'finanzasdelsur.com', industry: 'Fintech', ownerId: adminUser.id },
  ];

  const createdCompanies = await db.insert(companies).values(companiesData).returning();
  const companyMap = new Map(createdCompanies.map((c: any) => [c.name, c.id]));
  console.log('✅ Empresas creadas');

  // 5. Contacts (including intentional duplicates for testing)
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
  console.log('✅ Contactos creados');

  // 6. Deals
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
  console.log('✅ Oportunidades comerciales creadas');

  // 7. Tasks (including Overdue Tasks)
  const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const tasksData = [
    {
      title: 'Enviar propuesta técnica ajustada a Sofía Gómez',
      isCompleted: false,
      dueDate: yesterdayStr, // Overdue!
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
      dueDate: yesterdayStr, // Overdue!
      assignedTo: managerUser.id,
      createdBy: managerUser.id,
      contactId: contactMap.get('vrios@sistemasandinos.co'),
      dealId: dealMap.get('Infraestructura de Redes — Sistemas Andinos'),
    },
  ];

  await db.insert(tasks).values(tasksData);
  console.log('✅ Tareas creadas (incluyendo tareas vencidas)');

  // 8. Initial Activities
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
  console.log('✅ Historial de actividades creado');

  console.log('🎉 ¡Población de datos iniciales en español completada con éxito!');
}

seed().catch((err) => {
  console.error('Error durante la ejecución del seed:', err);
  process.exit(1);
});
