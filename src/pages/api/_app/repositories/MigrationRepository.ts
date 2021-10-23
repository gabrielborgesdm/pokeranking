import { IMigration } from "../../../../configs/types/IMigration";
import Migration from "../models/MigrationModel";

export default class MigrationRepository {
  async getExecutedMigrations(): Promise<Array<string>> {
    let migrations = [];
    const response: Array<IMigration> = await Migration.find({
      executed: true,
    }).exec();
    if (response && response.length) {
      migrations = response.map((migration: IMigration) => migration.name);
    }
    return migrations;
  }

  async saveExecutedMigration(migrationInfo: IMigration): Promise<IMigration> {
    let migration: IMigration = null;
    migration = await Migration.create(migrationInfo);
    return migration;
  }
}
