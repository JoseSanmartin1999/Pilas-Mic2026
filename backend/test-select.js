import db from './src/config/db.js';

async function selectMentors() {
    try {
        const [result] = await db.query("SELECT id, full_name, role, current_semester FROM Users");
        console.log("Users in DB:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Select Failed:", e.message);
    } finally {
        process.exit();
    }
}

selectMentors();
