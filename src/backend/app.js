const express = require('express');
const cors = require('cors');
const shoppingListRoutes = require('./routes/shoppingListRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/shoppingList', shoppingListRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    uuAppErrorMap: {
      serverError: {
        type: 'error',
        message: 'Internal server error',
        paramMap: {}
      }
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    uuAppErrorMap: {
      endpointNotFound: {
        type: 'error',
        message: 'Endpoint not found',
        paramMap: {
          path: req.originalUrl
        }
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Shopping List API server running on port ${PORT}`);
});

module.exports = app;
