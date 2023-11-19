const rules = [
  {
    value: "set-length",
    label: "fixed length",
    fields: ["length"],
    func: len => (w => w.length == len)
  },
  {
    value: "starts-with",
    label: "starts with letter",
    fields: ["letter"],
    func: letter => (w => w.startsWith(letter))
  },
  {
    value: "ends-with",
    label: "ends with letter",
    fields: ["letter"],
    func: letter => (w => w.endsWith(letter))
  },
  {
    value: "palindrome",
    label: "palindrome",
    fields: [],
    func: w => (w == [...w].reverse().join(''))
  }
]
