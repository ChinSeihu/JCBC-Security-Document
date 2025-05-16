import { parse as parseSync  } from 'csv-parse/sync'

export const formatFileSize = (size: number) => {
  const kb = size / 1024
  
  if (kb < 1024) return kb + 'KB';

  const mb = kb / 1024;
  return mb + 'MB';
}

/**
 * @param pickList 
 * @param target ソースオブジェクト
 * @returns 
 */
export const pick = <
  T extends Record<string, any>, 
  K extends keyof T
>(
  pickList: K[] = [],
  target: T
): Pick<T, K> => {
  const result = {} as Pick<T, K>;

  pickList.forEach((key) => {
    if (key in target) {
      result[key] = target[key];
    }
  });

  return result;
};

export const parseCsv = async (csvData: Buffer) => {
  const data = csvData.toString('utf8'); // Buffer 转字符串
  const results = parseSync(data, {
      columns: true, // 第一行为表头
      skip_empty_lines: true
  });
  return results;
}