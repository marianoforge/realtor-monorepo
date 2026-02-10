/**
 * @swagger
 * /api/operations:
 *   get:
 *     summary: Obtiene todas las operaciones de un usuario
 *     description: Retorna una lista de operaciones filtradas por el `teamId` del usuario autenticado.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de operaciones obtenida exitosamente.
 *       401:
 *         description: No autorizado (Token no proporcionado o inválido).
 *       500:
 *         description: Error en el servidor.
 *   post:
 *     summary: Crea una nueva operación
 *     description: Crea y almacena una nueva operación en la base de datos.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Operación creada exitosamente.
 *       400:
 *         description: Datos incorrectos o campos requeridos faltantes.
 *       500:
 *         description: Error al crear la operación.
 */
export default {};
