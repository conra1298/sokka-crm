import { db } from './index';
import { users, deals, companies, contacts, activities, tasks } from './schema';
import { eq, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function resetUsers() {
  console.log('Iniciando reseteo de usuarios...');
  
  const passwordHash = await bcrypt.hash('Sokka2026', 10);

  const newUsersData = [
    { email: 'conragiam@sokkaestudio.com.ar', name: 'Conrado Giampaoletti', role: 'admin' },
    { email: 'sofialencinas@sokkaestudio.com.ar', name: 'Sofía Lencinas', role: 'admin' },
    { email: 'conra1298@gmail.com', name: 'Conrado Backup', role: 'admin' },
  ];

  const existingUsers = await db.select().from(users);
  console.log(`Usuarios actuales encontrados: ${existingUsers.length}`);

  // We want to avoid FK constraint errors, so we update existing users with new info.
  // If there are more new users than existing users, we create the remainder.
  // If there are more existing users than new users, we will reassign their records to the first admin and delete them.

  for (let i = 0; i < newUsersData.length; i++) {
    if (i < existingUsers.length) {
      console.log(`Actualizando usuario: ${existingUsers[i].email} -> ${newUsersData[i].email}`);
      await db.update(users).set({
        email: newUsersData[i].email,
        name: newUsersData[i].name,
        passwordHash,
        role: newUsersData[i].role,
      }).where(eq(users.id, existingUsers[i].id));
    } else {
      console.log(`Creando nuevo usuario: ${newUsersData[i].email}`);
      await db.insert(users).values({
        email: newUsersData[i].email,
        name: newUsersData[i].name,
        passwordHash,
        role: newUsersData[i].role,
      });
    }
  }

  // Handle excess users
  if (existingUsers.length > newUsersData.length) {
    const mainAdminId = existingUsers[0].id;
    const excessUsers = existingUsers.slice(newUsersData.length);
    const excessIds = excessUsers.map(u => u.id);
    
    console.log(`Reasignando registros de ${excessIds.length} usuarios sobrantes a ${newUsersData[0].name}...`);
    
    await db.update(deals).set({ ownerId: mainAdminId }).where(inArray(deals.ownerId, excessIds));
    await db.update(companies).set({ ownerId: mainAdminId }).where(inArray(companies.ownerId, excessIds));
    await db.update(contacts).set({ ownerId: mainAdminId }).where(inArray(contacts.ownerId, excessIds));
    await db.update(activities).set({ createdBy: mainAdminId }).where(inArray(activities.createdBy, excessIds));
    await db.update(tasks).set({ createdBy: mainAdminId }).where(inArray(tasks.createdBy, excessIds));
    await db.update(tasks).set({ assignedTo: mainAdminId }).where(inArray(tasks.assignedTo, excessIds));

    console.log('Borrando usuarios sobrantes...');
    await db.delete(users).where(inArray(users.id, excessIds));
  }

  console.log('✅ Usuarios reseteados exitosamente.');
  process.exit(0);
}

resetUsers().catch(err => {
  console.error('Error reseteando usuarios:', err);
  process.exit(1);
});
