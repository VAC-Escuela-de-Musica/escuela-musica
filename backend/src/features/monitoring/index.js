import metricaController from "./controllers/metrica.controller.js";
import metricaRoutes from "./routes/metrica.routes.js";
import metricaService from "./services/metrica.service.js";
import Metrica from "../../core/models/metricas.entity.js";

import eventoController from "./controllers/evento.controller.js";
import eventoRoutes from "./routes/evento.routes.js";
import eventoService from "./services/evento.service.js";
import Evento from "../../core/models/evento.entity.js";

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