import chalk from "chalk";
// Define the character to number mapping
const charToNum = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10,
  k: 11,
  l: 12,
  m: 13,
  n: 14,
  o: 15,
  p: 16,
  q: 17,
  r: 18,
  s: 19,
  t: 20,
  u: 21,
  v: 22,
  w: 23,
  x: 24,
  y: 25,
  z: 26,
  "*": 27,
  "#": 28,
  " ": 29, // Space
} as any;

// Define the number to character mapping
const numToChar = Object.fromEntries(
  Object.entries(charToNum).map(([k, v]) => [v, k])
);

export function encodeText(text: String) {
  const encoded = [];
  for (const char of text) {
    encoded.push(charToNum[char.toLowerCase()] || "");
  }
  return encoded.join(" ");
}

export function decodeText(encodedText: String) {
  const decoded = [];
  const encodedChars = encodedText.split(" ");
  for (const num of encodedChars) {
    decoded.push(numToChar[parseInt(num)] || "");
  }
  return decoded.join("");
}

export function customLogger(req: any, res: any, next: any) {
  if (res.headersSent) {
    console.log(chalk.green(req.method, req.url, res.statusCode));
  } else {
    res.on("finish", function () {
      console.log(
        chalk.red(
          "x-sender",
          chalk.green.underline.bgBlue(req.headers["x-sender"]) + "."
        )
      );
      console.log(
        chalk.red(
          "x-reciever",
          chalk.green.underline.bgBlue(req.headers["x-reciever"]) + "."
        )
      );
      console.log(chalk.green(req.method, req.url, res.statusCode));
    });
  }
  next();
}
