import { db } from './index';
import { 
  companies, 
  contacts, 
  deals, 
  tasks, 
  activities, 
  dealServiceItems,
  companyTags,
  contactTags
} from './schema';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Cargar variables de entorno (simulando que se ejecuta en prod o local)
dotenv.config({ path: '.env.local' });

async function clearData() {
  console.log('🧹 Iniciando limpieza de datos de prueba...');

  try {
    // 1. Limpiar tablas de unión y tablas dependientes (Hijas)
    console.log('- Eliminando actividades...');
    await db.delete(activities);
    
    console.log('- Eliminando tareas...');
    await db.delete(tasks);
    
    console.log('- Eliminando items de servicios de las propuestas...');
    await db.delete(dealServiceItems);
    
    console.log('- Eliminando relaciones de etiquetas...');
    await db.delete(companyTags);
    await db.delete(contactTags);

    // 2. Limpiar Oportunidades (Deals)
    console.log('- Eliminando negocios/oportunidades...');
    await db.delete(deals);

    // 3. Limpiar Contactos y Empresas (Padres)
    console.log('- Eliminando contactos...');
    await db.delete(contacts);
    
    console.log('- Eliminando empresas...');
    await db.delete(companies);

    console.log('✅ ¡Limpieza completada exitosamente! El CRM está listo para producción.');
  } catch (error) {
    console.error('❌ Error durante la limpieza de datos:', error);
  }
}

clearData();
