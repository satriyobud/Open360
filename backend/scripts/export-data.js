const mysql = require('mysql2/promise');
require('dotenv').config();

// Get connection config (same as database.ts)
function getConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    const match = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        host: match[3],
        port: parseInt(match[4]),
        user: match[1],
        password: match[2],
        database: match[5],
      };
    }
    const matchNoPass = databaseUrl.match(/mysql:\/\/([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (matchNoPass) {
      return {
        host: matchNoPass[2],
        port: parseInt(matchNoPass[3]),
        user: matchNoPass[1],
        password: '',
        database: matchNoPass[4],
      };
    }
  }
  
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '360_feedback',
  };
}

async function exportData() {
  const config = getConnectionConfig();
  const connection = await mysql.createConnection(config);

  console.log('📦 Exporting data from local database...\n');

  try {
    // Export departments
    const [departments] = await connection.execute('SELECT * FROM departments ORDER BY id');
    console.log('-- Departments');
    console.log('INSERT INTO departments (id, name, created_at, updated_at) VALUES');
    const deptValues = departments.map((d, i) => {
      const comma = i < departments.length - 1 ? ',' : ';';
      return `(${d.id}, ${mysql.escape(d.name)}, ${mysql.escape(d.created_at)}, ${mysql.escape(d.updated_at)})${comma}`;
    }).join('\n');
    console.log(deptValues);
    console.log('\n');

    // Export users
    const [users] = await connection.execute('SELECT * FROM users ORDER BY id');
    console.log('-- Users');
    console.log('INSERT INTO users (id, name, email, password_hash, role, manager_id, department_id, created_at, updated_at) VALUES');
    const userValues = users.map((u, i) => {
      const comma = i < users.length - 1 ? ',' : ';';
      const managerId = u.manager_id ? u.manager_id : 'NULL';
      const deptId = u.department_id ? u.department_id : 'NULL';
      return `(${u.id}, ${mysql.escape(u.name)}, ${mysql.escape(u.email)}, ${mysql.escape(u.password_hash)}, ${mysql.escape(u.role)}, ${managerId}, ${deptId}, ${mysql.escape(u.created_at)}, ${mysql.escape(u.updated_at)})${comma}`;
    }).join('\n');
    console.log(userValues);
    console.log('\n');

    // Export categories
    const [categories] = await connection.execute('SELECT * FROM categories ORDER BY id');
    console.log('-- Categories');
    console.log('INSERT INTO categories (id, name, description, created_at, updated_at) VALUES');
    const catValues = categories.map((c, i) => {
      const comma = i < categories.length - 1 ? ',' : ';';
      const desc = c.description ? mysql.escape(c.description) : 'NULL';
      return `(${c.id}, ${mysql.escape(c.name)}, ${desc}, ${mysql.escape(c.created_at)}, ${mysql.escape(c.updated_at)})${comma}`;
    }).join('\n');
    console.log(catValues);
    console.log('\n');

    // Export questions
    const [questions] = await connection.execute('SELECT * FROM questions ORDER BY id');
    console.log('-- Questions');
    console.log('INSERT INTO questions (id, category_id, text, created_at, updated_at) VALUES');
    const qValues = questions.map((q, i) => {
      const comma = i < questions.length - 1 ? ',' : ';';
      return `(${q.id}, ${q.category_id}, ${mysql.escape(q.text)}, ${mysql.escape(q.created_at)}, ${mysql.escape(q.updated_at)})${comma}`;
    }).join('\n');
    console.log(qValues);
    console.log('\n');

    console.log('✅ Export complete!');
    console.log('\nNote: Copy the output above and save it as a SQL file.');

  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await connection.end();
  }
}

exportData();


