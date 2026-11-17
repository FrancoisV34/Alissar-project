import { crudRouter } from '../../lib/crudRouter.js';
import { schemas } from '../../lib/validation.js';

// /api/admin/formations : CRUD protégé (voir lib/crudRouter.js)
export default crudRouter({ table: 'formations', schema: schemas.formation, notFoundMessage: 'Formation non trouvée' });
