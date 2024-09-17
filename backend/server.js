const app = require('./app');

const port = 4000;

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution à http://localhost:${port}/`);
});
