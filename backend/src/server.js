import app from './app.js';
import dotenv from 'dotenv';
// Importamos DB para testear la conexión al arrancar
import db from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
});
