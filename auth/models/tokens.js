const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const crypto = require('crypto');


const pool = new Pool({
    host: 'postgres',
    port: 5432,
    database: 'dist_app',
    user: process.env.POSTS_DB_USER,
    password: process.env.POSTS_DB_PASSWORD,
});

const REFRESH_TTL_SEC = 60 * 60 * 24 * 7;

function createJti() {
  return crypto.randomBytes(16).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// CREATE
async function createRefreshToken({
    userId,
    tokenHash,
    jti,
    expiresAt,
    ip,
    userAgent
    }) {
    const result = await pool.query(
        `
        INSERT INTO dist_app.refresh_tokens
        (user_id, token_hash, jti, expires_at, ip, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [userId, tokenHash, jti, expiresAt, ip, userAgent]
    );

    return result.rows[0];
}

// FIND by hash + jti (used in refresh)
async function findByToken(tokenHash, jti) {
    const result = await pool.query(
        `
        SELECT * FROM dist_app.refresh_tokens
        WHERE token_hash = $1 AND jti = $2
        LIMIT 1
        `,
        [tokenHash, jti]
    );

    return result.rows[0];
}

// REVOKE
async function revokeToken(id) {
    await pool.query(
        `
        UPDATE dist_app.refresh_tokens
        SET revoked_at = NOW()
        WHERE id = $1
        `,
        [id]
    );
}

// ROTATE
async function replaceToken(oldId, newJti) {
    await pool.query(
        `
        UPDATE dist_app.refresh_tokens
        SET replaced_by = $1
        WHERE id = $2
        `,
        [newJti, oldId]
    );
}

function signAccessToken(user) {
  const payload = { id: user.id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(user, jti) {
  const payload = { id: user.id, jti };
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TTL_SEC });
  return token;
}

async function persistRefreshToken({ user, refreshToken, jti, ip, userAgent }) {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);
  await createRefreshToken({ userId: user.id, tokenHash, jti, expiresAt, ip, userAgent });
}

function setRefreshCookie(res, refreshToken) {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/auth/refresh',
    maxAge: REFRESH_TTL_SEC * 1000
  });
}

async function rotateRefreshToken(oldDoc, user, req, res) {
  const newJti = createJti();

  // revoke old token and point it to the new one
  await revokeToken(oldDoc.id);
  await replaceToken(oldDoc.id, newJti);

  // issue new tokens
  const newAccess = signAccessToken(user);
  const newRefresh = signRefreshToken(user, newJti);

  await persistRefreshToken({
    user,
    refreshToken: newRefresh,
    jti: newJti,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || ''
  });

  setRefreshCookie(res, newRefresh);
  return { accessToken: newAccess };
}

module.exports = {
  findByToken,
  hashToken,
  revokeToken,
  createJti,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setRefreshCookie,
  rotateRefreshToken
};