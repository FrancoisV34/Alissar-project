import { crudRouter } from '../../lib/crudRouter.js';
import { schemas } from '../../lib/validation.js';

// /api/admin/tarifs : CRUD protégé (voir lib/crudRouter.js)
export default crudRouter({ table: 'tarifs', schema: schemas.tarif, notFoundMessage: 'Tarif non trouvé' });
