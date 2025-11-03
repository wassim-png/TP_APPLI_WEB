import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../db/database.js';
import { verifyToken, createAccessToken, createRefreshToken } from '../middleware/token-managment.js';
import { JWT_SECRET } from '../config/en.js';
const router = Router();
router.post('/register', async (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.status(400).json({ error: 'Champs manquants' });
    }
    const hashed = await bcrypt.hash(password, 10);
    try {
        const { rows } = await pool.query(`INSERT INTO users (login, password_hash, role)
       VALUES ($1, $2, 'user')
       RETURNING id, login, role`, [login, hashed]);
        res.status(201).json({ message: 'Utilisateur créé', user: rows[0] });
    }
    catch (err) {
        if (err.code === '23505') { // doublon PostgreSQL
            return res.status(409).json({ error: 'Login déjà utilisé' });
        }
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
router.post('/refresh', (req, res) => {
    const refresh = req.cookies?.refresh_token;
    if (!refresh) {
        return res.status(401).json({ error: 'Refresh token manquant' });
    }
    try {
        const decoded = jwt.verify(refresh, JWT_SECRET);
        const newAccess = createAccessToken({ id: decoded.id, role: decoded.role });
        res.cookie('access_token', newAccess, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.json({ message: 'Token renouvelé' });
    }
    catch {
        res.status(403).json({ error: 'Refresh token invalide ou expiré' });
    }
});
router.post('/login', async (req, res) => {
    // --- LOGIN ---
    const { login, password } = req.body;
    if (!login || !password) // si pas de login ou password dans la requête => ERREUR : fin du login
        return res.status(400).json({ error: 'Identifiants manquants' });
    const { rows } = await pool.query('SELECT * FROM users WHERE login=$1', [login]); // on récupère le user dans la BD
    const user = rows[0];
    if (!user)
        return res.status(401).json({ error: 'Utilisateur inconnu' }); // pas dans la base => ERREUR : fin du login
    const match = await bcrypt.compare(password, user.password_hash); // on vérifie le password
    if (!match)
        return res.status(401).json({ error: 'Mot de passe incorrect' }); // si pas de match => ERREUR : fin du login
    const accessToken = createAccessToken({ id: user.id, role: user.role }); // création du token d'accès
    const refreshToken = createRefreshToken({ id: user.id, role: user.role }); // création du refresh token
    res.cookie('access_token', accessToken, {
        // --------------------------------- Cookies sécurisés pour le token d'accès
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
        // --------------------------------- Cookies sécurisés pour le refresh token
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: 'Authentification réussie', user: { login: user.login, role: user.role } }); //connexion successful
});
router.post('/logout', (_req, res) => {
    // --- LOGOUT ---
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({ message: 'Déconnexion réussie' });
});
router.get('/whoami', verifyToken, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, login, role FROM users WHERE id = $1', [req.user?.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ user: rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
export default router;
//# sourceMappingURL=auth.js.map