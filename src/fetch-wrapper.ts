import { Sequelize } from 'sequelize';
import { models } from './models';

type ResponseRecordBody = {
  type: 'json'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
} | {
  type: 'text'
  payload: string
}

export type ResponseRecord = {
  status: number
  headers: Headers
  data?: ResponseRecordBody
}

export function apiTestRaw(): {
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>
  end: () => ResponseRecord[]
} {
  const records: ResponseRecord[] = []
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async fetch (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> {
      const result = await fetch(input)
      const record: ResponseRecord = { status: result.status, headers: result.headers }
      records.push(record)
      const { json, text } = result
      result.json = async () => {
        const payload = await json.apply(result)
        record.data = {
          type: 'json',
          payload
        }
        return payload
      }
      result.text = async () => {
        const payload = await text.apply(result)
        record.data = {
          type: 'text',
          payload
        }
        return payload
      }
      return result
    },
    end() {
      return records
    }
  }
}

export function apiTestSqlite(path: string) {
  const original = apiTestRaw()
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path
  });
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetch: original.fetch,
    async end() {
      const records = original.end()
      const {
        addResponseRecord
      } = await models(sequelize)
      for(const record of records) {
        await addResponseRecord(record);
      }
    }
  }
  
}