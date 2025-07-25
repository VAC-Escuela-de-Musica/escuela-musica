import metricaController from "./controllers/metrica.controller.js";
import metricaRoutes from "./routes/metrica.routes.js";
import metricaService from "./services/metrica.service.js";
import Metrica from "./models/metrica.model.js";

import eventoController from "./controllers/evento.controller.js";
import eventoRoutes from "./routes/evento.routes.js";
import eventoService from "./services/evento.service.js";
import Evento from "./models/evento.model.js";

export {
    metricaController,
    metricaRoutes,
    metricaService,
    Metrica,
    eventoController,
    eventoRoutes,
    eventoService,
    Evento,
}; 