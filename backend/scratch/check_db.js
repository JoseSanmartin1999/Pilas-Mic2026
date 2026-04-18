import db from '../src/config/db.js';

async function check() {
    try {
        const [rows] = await db.query('DESCRIBE Mentorships');
        console.log("Mentorships schema:", rows);
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
check();
