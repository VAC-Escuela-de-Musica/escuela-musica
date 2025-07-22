import { model } from "mongoose";
import galeriaSchema from "../schema/galeria.schema.js";

// Exportar el modelo de datos 'Galeria'
export default model("Galeria", galeriaSchema);