const mysql = require("mysql2");

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
          price INT NOT NULL,
          event_id BIGINT NOT NULL,
          FOREIGN KEY (event_id) REFERENCES event_lists(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
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
        status ENUM('V', 'T', 'R', 'I') NOT NULL DEFAULT 'V',
        row_id INT NOT NULL,
        member_id BIGINT NULL,
        hold_expires_at DATETIME NULL, 
        order_number VARCHAR(16) NULL,
        FOREIGN KEY (row_id) REFERENCES seating_rows(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) 
          ON DELETE SET NULL
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
    await new Promise((resolve, reject) => {
      connection.query(
        "ALTER TABLE sections AUTO_INCREMENT = 1",
        (err, results) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      connection.query(
        "ALTER TABLE seating_rows AUTO_INCREMENT = 1",
        (err, results) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    const sections = [
      { name: "A", price: 4321, eventId: 8 }, // 示例：eventId 設為 1
      { name: "B", price: 4321, eventId: 8 },
      { name: "C", price: 3388, eventId: 8 },
      { name: "D", price: 3388, eventId: 8 },
    ];

    const sectionIds = await Promise.all(
      sections.map(({ name, price, eventId }) => {
        return new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO sections (section_name, price, event_id) VALUES (?, ?, ?)",
            [name, price, eventId],
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
