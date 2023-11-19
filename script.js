const urlParams = new URLSearchParams(window.location.search)

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
      let additionalField = document.createElement("input")
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
        sliderForm = document.createElement("form")
        sliderForm.id = "slider-form"

        slider = document.createElement("input")
        slider.setAttribute("type", "range")
        slider.id = "length-slider"

        sliderList = document.createElement("datalist")
        sliderList.id = "slider-values"

        possibleLengths = [4, 5, 6, 7, 8, 9, 10]
        for (let i=0;i<possibleLengths.length;i++) {
          var option = document.createElement("option")
          option.value = possibleLengths[i]
          option.label = possibleLengths[i]
          sliderList.appendChild(option)
        }
        cell.appendChild(sliderList)

        slider.setAttribute("list", "slider-values")
        slider.setAttribute("step", 1)
        slider.setAttribute("min", possibleLengths[0])
        slider.setAttribute("max", possibleLengths.slice(-1))
        slider.value = 4;
        sliderForm.appendChild(slider)

        sliderLabel = document.createElement("div")
        lengthDropdown = document.createElement("select")
        lengthDropdown.id = "length-dropdown"
        lengthDropdown.add(new Option("at least", "at-least"))
        lengthDropdown.add(new Option("exactly", "exactly"))

        lengthLabel = document.createElement("label")
        lengthLabel.setAttribute("for", "length-dropdown")
        lengthLabel.innerHTML = `${slider.value} letters`

        sliderLabel.appendChild(lengthDropdown)
        sliderLabel.appendChild(lengthLabel)
        sliderForm.appendChild(sliderLabel)

        cell.appendChild(sliderForm)

        slider.addEventListener("input", (event) => {
          lengthLabel.innerHTML = `${event.target.value} letters`
        })

        sliderForm.addEventListener("change", (event) =>
          {
            for (let y of [1,2,3]) {
              for (let x of [1,2,3]) {
                calculateCell(x, y)
              }
            }
          })
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
      headRuleFunc = headRuleFunc(fieldValue.trim().toLowerCase())
    } else {
      return
    }
  }

  for (let f of sideRule.fields) {
    let formFields = Array.from(sideForm.children[1].childNodes)
    fieldValue = formFields.find((v) => v.name == `${sideRule.value}_${f}`).value
    if (fieldValue) {
      sideRuleFunc = sideRuleFunc(fieldValue.trim().toLowerCase())
    } else {
      return
    }
  }

  wordLength = document.getElementById('length-slider').value
  if (document.getElementById('length-dropdown').value == "at-least") {
    lengthWords = words.filter((word) => word.length >= wordLength)
  } else {
    lengthWords = words.filter((word) => word.length == wordLength)
  }

  filteredList = lengthWords.filter( (word) =>
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