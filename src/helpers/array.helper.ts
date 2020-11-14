export class ArrayHelper {
  public static zip<T>(array1: T[], array2: T[]): [T, T][] {
    let longer: T[];
    let shorter: T[];
    if (array1.length >= array2.length) {
      [longer, shorter] = [array1, array2];
    } else {
      [longer, shorter] = [array2, array1];
    }
    return longer.map((v: T, index: number) => [v, shorter[index]]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static arrayToObject<TIn, TOut extends Record<string, any>>(
    array: TIn[],
    keySelector: (item: TIn) => string,
    valueSelector: (key: string, item: TIn) => TOut = (key, item): TOut => ({} as TOut)
  ): { [key: string]: TOut } {
    return array
      .map((obj) => {
        const key = keySelector(obj);
        return { [key]: valueSelector(key, obj) };
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }
}