import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import shoppingListRoutes from "./routes/shoppingListRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/shoppingList", shoppingListRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    errorMap: {
      serverError: {
        type: "error",
        message: "Internal server error",
        paramMap: {},
      },
    },
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    errorMap: {
      endpointNotFound: {
        type: "error",
        message: "Endpoint not found",
        paramMap: {
          path: req.originalUrl,
        },
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`Shopping List API server running on port ${PORT}`);
  console.log(`Server ready at http://localhost:${PORT}`);
  console.log(`API Documentation: Check README.md`);
  console.log(
    `Test with Insomnia: Import test/insomnia/shopping-list-api.json`,
  );
});
