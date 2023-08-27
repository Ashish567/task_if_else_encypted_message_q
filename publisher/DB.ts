const sqlite3 = require("sqlite3").verbose();
export class DB {
  private db: any;

  public constructor() {
    this.db = new sqlite3.Database(":memory:");
    this.db.serialize(() => {
      this.db.run(
        "CREATE TABLE message_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT, reciever TEXT, message TEXT)"
      );
    });
  }

  public getLogs(res: any): any {
    const query: String = "SELECT * FROM message_logs";
    this.db
      .all(query, (err: Error, row: any) => {
        if (err) res.send(err);
      })
      .all(query, (err: Error, rows: any) => {
        if (err) res.send(err);
        res.send({ data: rows });
      });
  }
  public saveLogs(message: any, req: any, res: any): any {
    const insert = this.db.prepare(
      "INSERT INTO message_logs (sender,reciever,message) VALUES (?, ?, ?)"
    );
    insert.run(
      req.headers["x-sender"],
      req.headers["x-reciever"],
      JSON.stringify(message)
    );
    insert.finalize();
  }
  public close() {
    this.db.close();
  }
}
