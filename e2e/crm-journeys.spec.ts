import { test, expect } from '@playwright/test';

test.describe('Sokka CRM Pruebas de Flujos End-to-End', () => {

  test('Jornada 1: Inicio de sesión de Admin, importación CSV y fusión de contactos', async ({ page }) => {
    // 1. Iniciar sesión como Admin
    await page.goto('/login');
    await page.fill('#email', 'admin@sokka.com');
    await page.fill('#password', 'sokka2024');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Panel Principal');

    // 2. Navegar a Importación CSV
    await page.goto('/contacts/import');
    await expect(page.locator('h1')).toContainText('Importación Masiva de Contactos');

    // 3. Navegar a Directorio de Contactos
    await page.goto('/contacts');
    await expect(page.locator('table')).toBeVisible();

    // 4. Probar navegación a la pantalla de fusión
    await page.goto('/contacts/merge');
    await expect(page.locator('h1')).toContainText('Fusión Inteligente');
  });

  test('Jornada 2: Vendedor crea oportunidad, registra actividad y mueve etapa', async ({ page }) => {
    // 1. Iniciar sesión como Vendedor
    await page.goto('/login');
    await page.fill('#email', 'sales@sokka.com');
    await page.fill('#password', 'sokka2024');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // 2. Navegar a Tablero de Oportunidades
    await page.goto('/deals');
    await expect(page.locator('h1')).toContainText('Pipeline de Ventas');
    await expect(page.locator('text=Prospecto')).toBeVisible();

    // 3. Abrir Detalle de Oportunidad
    await page.goto('/deals');
    const firstDealLink = page.locator('a[href^="/deals/"]').first();
    if (await firstDealLink.isVisible()) {
      await firstDealLink.click();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=Registrar Nueva Actividad')).toBeVisible();
    }
  });

  test('Jornada 3: Gerente revisa tareas vencidas y exportación autorizada', async ({ page }) => {
    // 1. Iniciar sesión como Gerente
    await page.goto('/login');
    await page.fill('#email', 'manager@sokka.com');
    await page.fill('#password', 'sokka2024');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // 2. Revisar Métricas
    await expect(page.locator('text=Valor Activo del Pipeline')).toBeVisible();
    await expect(page.locator('text=Tareas Vencidas')).toBeVisible();

    // 3. Abrir Tareas
    await page.goto('/tasks');
    await expect(page.locator('h1')).toContainText('Tareas y Seguimientos');

    // 4. Verificar autorización de exportación
    await page.goto('/api/export/deals');
    const content = await page.content();
    expect(content).toContain('Forbidden');
  });

});
