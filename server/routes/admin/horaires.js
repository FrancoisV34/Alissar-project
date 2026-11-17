import { crudRouter } from '../../lib/crudRouter.js';
import { schemas } from '../../lib/validation.js';

// /api/admin/horaires : CRUD protégé (voir lib/crudRouter.js)
export default crudRouter({ table: 'horaires', schema: schemas.horaire, notFoundMessage: 'Horaire non trouvé' });
