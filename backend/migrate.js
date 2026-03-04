import db from './src/config/db.js';

const MIGRATIONS = [
    { query: 'ALTER TABLE Users ADD COLUMN bio TEXT;', column: 'bio' },
    { query: 'ALTER TABLE Users ADD COLUMN profile_photo_url VARCHAR(500);', column: 'profile_photo_url' }
];

async function executeMigrations() {
    console.log("Iniciando verificación de esquema de base de datos...");

    for (const { query, column } of MIGRATIONS) {
        try {
            await db.query(query);
            console.log(`[EXITO] Columna '${column}' agregada exitosamente.`);
        } catch (error) {
            // Evaluamos si el error es debido a que la columna ya existe
            if (error.code === 'ER_DUP_FIELDNAME' || error.message.includes('Duplicate column')) {
                console.log(`[INFO] La columna '${column}' ya existe, omitiendo.`);
            } else {
                console.warn(`[ADVERTENCIA] Error inesperado con '${column}': ${error.message}`);
            }
        }
    }

    console.log("Verificación finalizada.");
}

async function syncDB() {
    try {
        await executeMigrations();
    } catch (e) {
        console.error("[ERROR CRÍTICO] Script de migración falló:", e);
    } finally {
        process.exit(0);
    }
}

syncDB();
