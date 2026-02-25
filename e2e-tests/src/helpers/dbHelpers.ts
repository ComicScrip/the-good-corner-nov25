import db from "../../../backend/src/db";

export async function connectDB() {
    await db.initialize();
}

export async function disconnectDB() {
    await db.destroy();
}