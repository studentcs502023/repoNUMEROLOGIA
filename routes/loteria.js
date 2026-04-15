import { Router } from 'express';
import { obtenerTodasLasLoterias } from '../helpers/loteria.js';
import { validarJWT } from '../helpers/validar-JWT.js';
import { esPremium } from '../middlewares/pagos.js';

const router = Router();

router.get('/todas', [validarJWT, esPremium], async (req, res) => {
    try {
        const resultados = await obtenerTodasLasLoterias();
        res.json({ success: true, data: resultados });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Error al obtener las loterías' });
    }
});

export default router;
