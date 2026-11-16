import { crudRouter } from '../../lib/crudRouter.js';
import { schemas } from '../../lib/validation.js';

// /api/admin/faqs : CRUD protégé (voir lib/crudRouter.js)
export default crudRouter({ table: 'faqs', schema: schemas.faq, notFoundMessage: 'FAQ non trouvée' });
