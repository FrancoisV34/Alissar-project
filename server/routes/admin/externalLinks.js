import { crudRouter } from '../../lib/crudRouter.js';
import { schemas } from '../../lib/validation.js';

// /api/admin/externalLinks : CRUD protégé (voir lib/crudRouter.js)
export default crudRouter({ table: 'external_links', schema: schemas.externalLink, notFoundMessage: 'Lien non trouvé' });
