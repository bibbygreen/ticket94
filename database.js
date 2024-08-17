const mysql = require("mysql2");

// Create a connection to the database
// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: 3306,
// });
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "ticket94",
  port: 3306,
});

// Connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database.");
  createTables();
});

function createTables() {
  const createSectionsTable = `
      CREATE TABLE IF NOT EXISTS sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          section_name CHAR(10) NOT NULL,
          price INT NOT NULL
      );
  `;

  const createSeatingRowsTable = `
      CREATE TABLE IF NOT EXISTS seating_rows (
          id INT AUTO_INCREMENT PRIMARY KEY,
          row_num INT NOT NULL,
          section_id INT NOT NULL,
          FOREIGN KEY (section_id) REFERENCES sections(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE
      );
  `;

  const createSeatsTable = `
      CREATE TABLE IF NOT EXISTS seats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seat_num VARCHAR(10) NOT NULL,
        status ENUM('V', 'T', 'R') NOT NULL DEFAULT 'V',
        row_id INT NOT NULL,
        hold_expires_at DATETIME NULL, 
        FOREIGN KEY (row_id) REFERENCES seating_rows(id)
              ON DELETE CASCADE
              ON UPDATE CASCADE
      );
  `;

  // Execute table creation queries in sequence
  connection.query(createSectionsTable, (err, results) => {
    if (err) throw err;
    console.log("Sections table created.");
    createSeatingRows();
  });

  function createSeatingRows() {
    connection.query(createSeatingRowsTable, (err, results) => {
      if (err) throw err;
      console.log("Seating Rows table created.");
      createSeats();
    });
  }

  function createSeats() {
    connection.query(createSeatsTable, (err, results) => {
      if (err) throw err;
      console.log("Seats table created.");
      insertData();
    });
  }
}

async function insertData() {
  try {
    const sections = [
      { name: "A", price: 3000 },
      { name: "B", price: 3000 },
      { name: "C", price: 2500 },
      { name: "D", price: 2500 },
    ];

    const sectionIds = await Promise.all(
      sections.map(({ name, price }) => {
        return new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO sections (section_name, price) VALUES (?, ?)",
            [name, price],
            (err, results) => {
              if (err) return reject(err);
              resolve(results.insertId);
            }
          );
        });
      })
    );

    // Insert rows 1-25 for each section
    const rowIds = await Promise.all(
      sectionIds.flatMap((sectionId) => {
        return Array.from({ length: 25 }, (_, i) => i + 1).map((rowNumber) => {
          return new Promise((resolve, reject) => {
            connection.query(
              "INSERT INTO seating_rows (row_num, section_id) VALUES (?, ?)",
              [rowNumber, sectionId],
              (err, results) => {
                if (err) return reject(err);
                resolve(results.insertId);
              }
            );
          });
        });
      })
    );

    // Insert seats 1-20 for each row
    await Promise.all(
      rowIds.flatMap((rowId) => {
        return Array.from({ length: 20 }, (_, i) => i + 1).map((seatNumber) => {
          return new Promise((resolve, reject) => {
            connection.query(
              "INSERT INTO seats (seat_num, row_id) VALUES (?, ?)",
              [seatNumber.toString().padStart(2, "0"), rowId],
              (err, results) => {
                if (err) return reject(err);
                resolve();
              }
            );
          });
        });
      })
    );

    console.log("Data inserted into tables.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    connection.end();
  }
}
