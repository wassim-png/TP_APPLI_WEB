"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var https_1 = require("https");
var express_1 = require("express");
var cors_1 = require("cors");
var morgan_1 = require("morgan");
var cookie_parser_1 = require("cookie-parser");
var public_js_1 = require("./routes/public.js");
var initAdmin_js_1 = require("./config/initAdmin.js");
var users_js_1 = require("./routes/users.js");
require("dotenv/config");
var auth_js_1 = require("./routes/auth.js");
var token_managment_js_1 = require("./middleware/token-managment.js");
var auth_admin_js_1 = require("./middleware/auth-admin.js");
// Création de l’application Express
var app = (0, express_1.default)();
// Ajout manuel des principaux en-têtes HTTP de sécurité
app.use(function (req, res, next) {
    // Empêche le navigateur d’interpréter un fichier d’un autre type MIME -> attaque : XSS via upload malveillant
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Interdit l'intégration du site dans des iframes externes -> attaque : Clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Évite que les URL avec paramètres sensibles apparaissent dans les en-têtes "Referer" -> attaque : Token ou paramètres dans l’URL
    res.setHeader('Referrer-Policy', 'no-referrer');
    // Politique de ressources : seules les ressources du même site peuvent être chargées -> attaque : Fuite de données statiques
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    // Politique d'ouverture inter-origine (Empêche le partage de contexte entre onglets) -> attaque : de type Spectre - isolation des fenêtres
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    // Politique d'intégration inter-origine (empêche les inclusions non sûres : force l’isolation complète des ressources intégrées) -> Attaques par chargement de scripts
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});
app.use((0, morgan_1.default)('dev')); // Log des requêtes : Visualiser le flux de requêtes entre Angular et Express
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Configuration CORS : autoriser le front Angular en HTTPS local
app.use((0, cors_1.default)({
    origin: [
        'https://localhost:4200', // Angular en dev local
        'http://localhost:8080' // Frontend dockerisé (Nginx)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Routes publiques
app.use('/api/public', public_js_1.default);
app.use('/api/auth', auth_js_1.default);
app.use('/api/users', token_managment_js_1.verifyToken, users_js_1.default); // protégé
app.use('/api/admin', token_managment_js_1.verifyToken, auth_admin_js_1.requireAdmin, function (req, res) {
    res.json({ message: 'Bienvenue admin' });
});
// Chargement du certificat et clé générés par mkcert (étape 0)
var key = fs_1.default.readFileSync('./certs/localhost-key.pem');
var cert = fs_1.default.readFileSync('./certs/localhost.pem');
// Lancement du serveur HTTPS
https_1.default.createServer({ key: key, cert: cert }, app).listen(4000, function () {
    console.log('� Serveur API démarré sur https://localhost:4000');
});
await (0, initAdmin_js_1.ensureAdmin)();
