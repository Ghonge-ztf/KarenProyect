import dotenv from "dotenv";
import server from "./server";
import { connectToDatabase } from "./utils/mongo";

dotenv.config();

const port = Number(process.env.PORT ?? 4567);
if (Number.isNaN(port)) {
  throw new Error("PORT debe ser un número válido");
}
const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/";
const mongoDb = process.env.MONGODB_DB ?? "KarenDb";

// console.log(`base de datos: ${mongoDb}`);

const startServer = async () => {
  
  await connectToDatabase(mongoUri, mongoDb);

  server.listen(port, () => {
    console.log(`Servidor montado en el puerto: ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Error iniciando la aplicación", error);
  process.exit(1);
});
