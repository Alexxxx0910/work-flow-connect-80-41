
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const userModel = {
  // Create a new user
  async create(userData) {
    const { username, email, password, avatar, bio, skills } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Process skills to ensure it's stored as a JSON string
    const processedSkills = skills ? JSON.stringify(skills) : null;
    
    // Usado name en lugar de username para ser consistente con la estructura de la BD
    // Usado photoURL en lugar de avatar y isOnline en lugar de status
    const result = await db.query(
      'INSERT INTO "Users" (id, name, email, password, "photoURL", "isOnline", role, bio, skills, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, name, email, "photoURL", role, "createdAt", bio, skills',
      [username, email, hashedPassword, avatar || null, true, 'client', bio || null, processedSkills]
    );
    
    const user = result.rows[0];
    
    // Parse skills if it's a JSON string
    if (user && user.skills && typeof user.skills === 'string') {
      try {
        user.skills = JSON.parse(user.skills);
      } catch (e) {
        user.skills = [];
      }
    }
    
    return user;
  },
  
  // Find user by email
  async findByEmail(email) {
    const result = await db.query('SELECT * FROM "Users" WHERE email = $1', [email]);
    const user = result.rows[0];
    
    // Parse skills if it's a JSON string
    if (user && user.skills && typeof user.skills === 'string') {
      try {
        user.skills = JSON.parse(user.skills);
      } catch (e) {
        user.skills = [];
      }
    }
    
    return user;
  },
  
  // Find user by ID
  async findById(id) {
    const result = await db.query(
      'SELECT id, name, email, "photoURL" as avatar, "isOnline" as status, "lastSeen", "createdAt", bio, skills FROM "Users" WHERE id = $1',
      [id]
    );
    
    const user = result.rows[0];
    
    if (user && user.skills && typeof user.skills === 'string') {
      try {
        user.skills = JSON.parse(user.skills);
      } catch (e) {
        user.skills = [];
      }
    }
    
    return user;
  },
  
  // Get all users except the one with the given ID
  async findAllExcept(userId) {
    const result = await db.query(
      'SELECT id, name, email, "photoURL" as avatar, "isOnline" as status, "lastSeen", "createdAt", bio, skills FROM "Users" WHERE id != $1',
      [userId]
    );
    
    const users = result.rows;
    
    // Parse skills for each user
    users.forEach(user => {
      if (user.skills && typeof user.skills === 'string') {
        try {
          user.skills = JSON.parse(user.skills);
        } catch (e) {
          user.skills = [];
        }
      }
    });
    
    return users;
  },
  
  // Update user status
  async updateStatus(userId, status) {
    const isOnline = status === 'online';
    const result = await db.query(
      'UPDATE "Users" SET "isOnline" = $1, "lastSeen" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, "isOnline"',
      [isOnline, userId]
    );
    return result.rows[0];
  },
  
  // Update user profile
  async updateProfile(userId, userData) {
    const { username, avatar, bio, skills } = userData;
    
    // Process skills to ensure it's stored as a JSON string
    let processedSkills = null;
    if (skills && Array.isArray(skills)) {
      processedSkills = JSON.stringify(skills);
    }
    
    const result = await db.query(
      'UPDATE "Users" SET name = COALESCE($1, name), "photoURL" = COALESCE($2, "photoURL"), bio = COALESCE($3, bio), skills = COALESCE($4, skills), "updatedAt" = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, "photoURL" as avatar, "isOnline" as status, bio, skills',
      [username, avatar, bio, processedSkills, userId]
    );
    
    const user = result.rows[0];
    
    // Parse skills back to array
    if (user && user.skills && typeof user.skills === 'string') {
      try {
        user.skills = JSON.parse(user.skills);
      } catch (e) {
        user.skills = [];
      }
    }
    
    return user;
  }
};

module.exports = userModel;
