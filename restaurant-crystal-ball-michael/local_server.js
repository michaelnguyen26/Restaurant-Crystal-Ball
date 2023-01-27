const app = require('./functions/server');

// Start Server.
const PORT = process.env.PORT || 3030;
app.listen(PORT, function(){
  console.log(`Server started on http://localhost:${PORT}/.netlify/functions/server`);
});