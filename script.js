const ruleSelection = document.createElement("form")
ruleSelection.classList.add("form-container")
const dropdownMenu = ruleSelection.appendChild(document.createElement("select"))
dropdownMenu.classList.add("dropdown-menu")
opt = dropdownMenu.appendChild(document.createElement("option"))
opt.value = ""
opt.text = "Select rule to apply"
const additionalFields = document.createElement("div")
additionalFields.classList.add("additional-fields")
for (let r of rules) {
  dropdownMenu.add(new Option(r.label, r.value))
  for (let f of r.fields) {
      additionalField = document.createElement("input")
      additionalField.setAttribute("type", "text")
      additionalField.setAttribute("name", `${r.value}_${f}`)
      additionalField.classList.add("hidden")
      additionalFields.appendChild(additionalField)
  }
}
ruleSelection.appendChild(additionalFields)

function drawGrid(numCols, numRows) {
  let table = document.getElementById("grid")

  for (let y=0; y < numRows + 1; y++) {
    let row = table.appendChild(document.createElement("tr"))
    for (let x=0; x < numCols + 1; x++) {
      if (y>=1 && x>=1) {
        let cell = row.appendChild(document.createElement("td"))
        cell.id = `cell_${x}_${y}`
        cell_body = document.createElement("div")
        cell_body.classList.add("cell")
        cell_body.appendChild(document.createElement("div")).classList.add("wordcount")
        wordlist = document.createElement("textarea")
        wordlist.setAttribute("readonly", true)
        wordlist.classList.add("wordlist")
        cell_body.appendChild(wordlist)
        cell.appendChild(cell_body)
      } else if (y==0 && x==0) {
        let cell = row.appendChild(document.createElement("th"))
        cell.id = "corner"
      } else {
        let cell = row.appendChild(document.createElement("th"))
        menu = cell.appendChild(ruleSelection.cloneNode("deep"))
        menu.id = `menu_${x}_${y}`
        //menu.addEventListener("submit", (event) => {return false;})
        dropdown = menu.firstChild
        dropdown.addEventListener("change", (event) => {
          selectedRule = rules.find((r) => r.value == event.target.value) || {}
          formFields = event.target.parentElement.children[1].childNodes
          for (let f of formFields) {
            if (!f.name.startsWith(selectedRule.value)) {
              f.classList.add("hidden")
            } else {
              f.classList.remove("hidden")
            }
          }
        })
        menu.addEventListener("change", (event) => {
          let affectedCells = []
          if (x>0) {
            for (let y of Array.from(new Array(numRows), (_, i) => i + 1)){
              affectedCells.push([x,y])
            }
          } else if (y>0) {
            for (let x of Array.from(new Array(numCols), (_, i) => i + 1)){
              affectedCells.push([x,y])
            }
          }
          for (let cell of affectedCells) {
            calculateCell(cell[0], cell[1])
          }
        })
      }
    }
  }
}

function calculateCell(x, y) { 
  let headForm = document.getElementById(`menu_${x}_0`);
  let sideForm = document.getElementById(`menu_0_${y}`);

  let headFormValue = headForm.firstChild.value
  let sideFormValue = sideForm.firstChild.value

  if (!(headFormValue && sideFormValue)){
    return
  }

  let headRule = rules.find((r) => r.value == headFormValue)
  let sideRule = rules.find((r) => r.value == sideFormValue)

  let headRuleFunc = headRule.func
  let sideRuleFunc = sideRule.func

  for (let f of headRule.fields) {
    let formFields = Array.from(headForm.children[1].childNodes)
    fieldValue = formFields.find((v) => v.name == `${headRule.value}_${f}`).value
    if (fieldValue) {
      console.log("fieldValue!", fieldValue)
      headRuleFunc = headRuleFunc(fieldValue)
    } else {
      return
    }
  }

  for (let f of sideRule.fields) {
    let formFields = Array.from(sideForm.children[1].childNodes)
    fieldValue = formFields.find((v) => v.name == `${sideRule.value}_${f}`).value
    if (fieldValue) {
      console.log("fieldValue!", fieldValue)
      sideRuleFunc = sideRuleFunc(fieldValue)
    } else {
      return
    }
  }

  filteredList = words.filter( (word) => 
    (headRuleFunc(word) &&
    sideRuleFunc(word)))

  cell = document.getElementById(`cell_${x}_${y}`)
  cell.querySelector(".wordcount").innerHTML = filteredList.length
  cell.querySelector(".wordlist").value = filteredList.join("\n")
}

function blockSubmit(event) {
  event.preventDefault()
}

drawGrid(3,3)