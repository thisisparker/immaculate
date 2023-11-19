const rules = [
  {
    value: "regex",
    label: "regex, baby",
    fields: ["regex"],
    func: regex => (w => new RegExp(regex).test(w))
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
    value: "starts-and-ends",
    label: "starts and ends with letter",
    fields: ["letter"],
    func: letter => (w => w.startsWith(letter) && w.endsWith(letter))
  },
  {
    value: "substring-anywhere",
    label: "substring anywhere",
    fields: ["substring"],
    func: substring => (w => w.includes(substring))
  },
  {
    value: "only-vowels-are",
    label: "only vowel(s) are",
    fields: ["vowels"],
    func: vowels => ((w) => {
      let excluded = [...'aeiou'].filter((v) => ![...vowels].includes(v)).join("");
      let re = new RegExp(`[${excluded}]`);
      return !re.test(w)
    })
  },
  {
    value: "at-least-2",
    label: "at least 2 of",
    fields: ["letter"],
    func: letter => (w => (w.match(new RegExp(letter, "g")) || []).length >= 2)
  },
  {
    value: "at-least-x",
    label: "at least X of",
    fields: ["letter", "count"],
    func: count => letter => (w => (w.match(new RegExp(letter, "g")) || []).length >= count)
  },
  {
    value: "superset",
    label: "has all of",
    fields: ["letters"],
    func: letters => (w => [...letters].every((l) => w.includes(l)))
  },
  {
    value: "has-none-of",
    label: "has none of",
    fields: ["letters"],
    func: letters => (w => {
      re = new RegExp(`[${letters}]`)
      return !re.test(w)
    })
  },
  {
    value: "letterbank",
    label: "comes from letterbank",
    fields: ["letters"],
    func: letters => (w => [...w].every((l) => letters.includes(l)))
  },
  {
    value: "palindrome",
    label: "palindrome",
    fields: [],
    func: w => (w == [...w].reverse().join(''))
  },
  {
    value: "isogram",
    label: "no repeated letters",
    fields: [],
    func: w => (w.length == new Set(w.split('')).size)
  },
  {
    value: "set-length",
    label: "fixed length",
    fields: ["length"],
    func: len => (w => w.length == len)
  },
  {
    value: "show-all",
    label: "show all",
    fields: [],
    func: w => w
  }
]
