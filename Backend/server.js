import { config } from "./src/config/config.js";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = config.PORT || 5003;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Failed to start the server: ${error}`);
        process.exit(1);
    }
};

startServer();
