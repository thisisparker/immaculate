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
    value: "substring-anywhere",
    label: "substring anywhere",
    fields: ["substring"],
    func: substring => (w => w.includes(substring))
  },
  {
    value: "at-least-2",
    label: "at least 2 of a given letter",
    fields: ["letter"],
    func: letter => (w => (w.match(new RegExp(letter, "g")) || []).length >= 2)
  },
  {
    value: "palindrome",
    label: "palindrome",
    fields: [],
    func: w => (w == [...w].reverse().join(''))
  }
]
