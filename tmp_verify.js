const bcrypt = require('bcryptjs');
const password = "AdminTempPassword2026!";
const hash = "$2b$10$aooKGZHGUCmeUBN1Y.0gz.YBNJl2tpTFy1qqqhwVjxAgWY4tq8ngy";
bcrypt.compare(password, hash).then(match => {
  console.log("Match:", match);
});
