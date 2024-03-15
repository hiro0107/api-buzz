import { DataTypes, Sequelize } from "sequelize";
import { ResponseRecord } from "./fetch-wrapper";

export async function models(sequelize: Sequelize) {
  const Record = sequelize.define('record', {
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  const Header = sequelize.define('header', {
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });
  Record.hasMany(Header)
  await Record.sync({ alter: true })
  await Header.sync({ alter: true })

  async function addResponseRecord(rec: ResponseRecord) {
    console.log({
      status: rec.status,
      Headers:
        [...rec.headers.entries()].map(entry => ({
          key: entry[0],
          value: entry[1]
        }))
    })
    const record = await Record.create({
      status: rec.status,
      headers:
        [...rec.headers.entries()].map(entry => ({
          key: entry[0],
          value: entry[1]
        }))
    }, {
      include: [ Header ]
    })
    record.save()
  }
  return {
    Record,
    Header,
    addResponseRecord,
  }
}