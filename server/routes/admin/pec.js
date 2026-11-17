import { crudRouter } from '../../lib/crudRouter.js';
import { schemas } from '../../lib/validation.js';

// /api/admin/pec : CRUD protégé (voir lib/crudRouter.js)
export default crudRouter({ table: 'pec_bubbles', schema: schemas.pec, notFoundMessage: 'Spécialité non trouvée' });
