const { v4: uuidv4 } = require('uuid');
const { sql } = require('../../db');



async function trackDevice(deviceId, deviceName) {
    try {
        const existing = await sql`
            SELECT * FROM devices WHERE device_id = ${deviceId}
        `;

        if (existing.length === 0) {
            await sql`
                INSERT INTO devices (device_id, device_name, first_seen, last_seen, total_tasks_created)
                VALUES (${deviceId}, ${deviceName || 'Unknown'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
            `;
            console.log(`📱 New device registered: ${deviceName || 'Unknown'} (${deviceId})`);
        } else {
            await sql`
                UPDATE devices 
                SET last_seen = CURRENT_TIMESTAMP
                WHERE device_id = ${deviceId}
            `;
        }
    } catch (error) {
        console.error('Error tracking device:', error);
    }
}

async function incrementDeviceTaskCount(deviceId) {
    try {
        await sql`
            UPDATE devices 
            SET total_tasks_created = total_tasks_created + 1,
                last_seen = CURRENT_TIMESTAMP
            WHERE device_id = ${deviceId}
        `;
    } catch (error) {
        console.error('Error incrementing device task count:', error);
    }
}

async function getDeviceStats(deviceId) {
    const stats = await sql`
        SELECT 
            COUNT(*) as total_tasks,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
        FROM todos 
        WHERE device_id = ${deviceId}
    `;
    return stats[0];
}
async function addTodo(todo) {
    const id = uuidv4();
    const now = new Date();

    const newTodo = {
        id: id,
        title: todo.title,
        description: todo.description || '',
        status: todo.status || 'pending',
        created_by: todo.created_by || 'Anonymous',
        updated_by: todo.updated_by || 'Anonymous',
        device_id: todo.deviceId || null,
        created_at: now,
        updated_at: now
    };

    await sql`
        INSERT INTO todos (id, title, description, status, created_by, updated_by, device_id, created_at, updated_at)
        VALUES (${newTodo.id}, ${newTodo.title}, ${newTodo.description}, ${newTodo.status}, 
                ${newTodo.created_by}, ${newTodo.updated_by}, ${newTodo.device_id}, ${newTodo.created_at}, ${newTodo.updated_at})
    `;

    console.log('✅ Todo added to database:', newTodo.id);
    return newTodo;
}

async function updateTodo(todo) {
    await sql`
        UPDATE todos 
        SET title = ${todo.title}, 
            description = ${todo.description}, 
            updated_by = ${todo.updated_by},
            device_id = COALESCE(${todo.deviceId}, device_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${todo.id}
    `;
    console.log('✅ Todo updated in database:', todo.id);
}

async function updateStatus(todo) {
    await sql`
        UPDATE todos 
        SET status = ${todo.status}, 
            updated_by = ${todo.updated_by},
            device_id = COALESCE(${todo.deviceId}, device_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${todo.id}   
    `;
    console.log('✅ Todo status updated in database:', todo.id);
}


async function deleteTodo(todo) {
    await sql`DELETE FROM todos WHERE id = ${todo.id}`;
    console.log('✅ Todo deleted from database:', todo.id);
}

async function getAllTodos() {
    return await sql`SELECT * FROM todos ORDER BY updated_at DESC`;
}

async function getTodoById(id) {
    return await sql`SELECT * FROM todos WHERE id = ${id}`;
}

async function getTodosByStatus(status) {
    return await sql`
        SELECT * FROM todos 
        WHERE status = ${status} 
        ORDER BY updated_at DESC
    `;
}
async function getAllDevices() {
    return await sql`
        SELECT * FROM devices 
        ORDER BY last_seen DESC
    `;
}
async function searchTodos(query) {
    return await sql`
        SELECT * FROM todos 
        WHERE title ILIKE ${'%' + query + '%'} 
           OR description ILIKE ${'%' + query + '%'}
        ORDER BY updated_at DESC
    `;
}

async function getStats() {
    const total = await sql`SELECT COUNT(*) FROM todos`;
    const pending = await sql`SELECT COUNT(*) FROM todos WHERE status = 'pending'`;
    const inProgress = await sql`SELECT COUNT(*) FROM todos WHERE status = 'in_progress'`;
    const completed = await sql`SELECT COUNT(*) FROM todos WHERE status = 'completed'`;
    const devices = await sql`SELECT COUNT(*) FROM devices`;

    return {
        total: parseInt(total[0].count),
        pending: parseInt(pending[0].count),
        in_progress: parseInt(inProgress[0].count),
        completed: parseInt(completed[0].count),
        total_devices: parseInt(devices[0].count)
    };
}

module.exports = {
    trackDevice,
    incrementDeviceTaskCount,
    getAllDevices,
    getDeviceStats,

    addTodo,
    updateTodo,
    deleteTodo,
    updateStatus,
    getAllTodos,
    getTodoById,
    getTodosByStatus,
    searchTodos,
    getStats
};
