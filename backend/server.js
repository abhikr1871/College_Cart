// const Mongodb_url ="mongodb+srv://abhiKr1871:Abhijeet123@collegecart.tgdzn.mongodb.net/";/
const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

