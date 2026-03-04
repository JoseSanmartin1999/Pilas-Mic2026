import db from './src/config/db.js';

async function testInsert() {
    try {
        const [result] = await db.query(
            "INSERT INTO Users (full_name, email, password_hash, role, institution, career, student_id, current_semester, bio, profile_photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ['test3', 'test3@espe.edu.ec', 'hash', 'APRENDIZ', 'ESPE', 'SW', 'L000000', 1, null, null]
        );
        console.log("Insert success:", result.insertId);
    } catch (e) {
        console.error("Insert Failed:", e.message);
    } finally {
        process.exit();
    }
}

testInsert();
