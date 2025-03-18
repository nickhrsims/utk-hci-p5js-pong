export const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * max) + min;
};

export const randomChoice = (options: any[]): any => {
  return options[random(0, options.length)];
}

export const range = (limit: number): number[] => {
  const result = [];
  for (let idx = 0; idx < limit; ++idx) {
    result.push(idx);
  }
  return result;
}

