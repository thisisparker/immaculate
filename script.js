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

        sliderLabel.appendChild(lengthDropdown)
        sliderLabel.appendChild(lengthLabel)
        sliderForm.appendChild(sliderLabel)

        cell.appendChild(sliderForm)

        updateLengthLabel()

        slider.addEventListener("input", updateLengthLabel)

        exportButton = document.createElement("button")
        exportButton.innerHTML = "copy as url"
        exportButton.addEventListener("click", (event) => {
          let stateBlob = exportState().match(/.{1,80}/g).join("-")
          navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${stateBlob}`)
        }
        )
        cell.appendChild(exportButton)

        sliderForm.addEventListener("change", updateCells)
        cell.id = "corner"
      } else {
        let cell = row.appendChild(document.createElement("th"))
        menu = cell.appendChild(ruleSelection.cloneNode("deep"))
        menu.id = `menu_${x}_${y}`
        dropdown = menu.firstChild
        dropdown.addEventListener("change", event => {
          updateMenu(event.target.parentElement.id)
        })
        menu.addEventListener("change", (event) => {
          affectedCells = x ? [[x,1],[x,2],[x,3]] : [[1,y],[2,y],[3,y]]
          for (let cell of affectedCells) {
            calculateCell(cell[0], cell[1])
          }
        })
      }
    }
  }
}

function calculateCell(x, y) { 
  let menuForms = [document.getElementById(`menu_${x}_0`),
  document.getElementById(`menu_0_${y}`)];

  let ruleFuncs = []
  for (let f of menuForms) {
    formValue = f.firstChild.value
    if (!formValue) {return}

    selectedRule = rules.find((r) => r.value == formValue)

    let ruleFunc = selectedRule.func

    for (let field of selectedRule.fields) {
      let formFields = Array.from(f.children[1].childNodes)
      fieldValue = formFields.find((v) => {
        return v.name == `${selectedRule.value}_${field}`
      }).value
      if (fieldValue) {
        ruleFunc = ruleFunc(fieldValue.trim().toLowerCase())
      } else {
        return
      }
    }
    ruleFuncs.push(ruleFunc)
  }

  wordLength = document.getElementById('length-slider').value
  if (document.getElementById('length-dropdown').value == "at-least") {
    lengthWords = words.filter((word) => word.length >= wordLength)
  } else {
    lengthWords = words.filter((word) => word.length == wordLength)
  }

  filteredList = lengthWords.filter( (word) =>
    (ruleFuncs[0](word) &&
     ruleFuncs[1](word)))

  cell = document.getElementById(`cell_${x}_${y}`)
  cell.querySelector(".wordcount").innerHTML = filteredList.length
  cell.querySelector(".wordlist").value = filteredList.join("\n")
}

function updateCells() {
  for (let y of [1,2,3]) {
    for (let x of [1,2,3]) {
      calculateCell(x, y)
    }
  }
}

function updateMenu(menuId) {
  menu = document.getElementById(menuId)
  selectedItem = menu.querySelector(".dropdown-menu")
  selectedRule = rules.find((r) => r.value == selectedItem.value) || {}
  formFields = menu.children[1].childNodes
  for (let f of formFields) {
    if (!f.name.startsWith(selectedRule.value)) {
      f.classList.add("hidden")
    } else {
      f.classList.remove("hidden")
    }
  }
}

function updateLengthLabel() {
  let slider = document.getElementById("length-slider")
  let sliderLabel = document.getElementById("slider-form").querySelector("label")
  sliderLabel.innerHTML = `${slider.value} letters`
}

function exportState() {
  let state = {
    "length-slider" : document.getElementById("length-slider").value,
    "length-dropdown": document.getElementById("length-dropdown").value
  }
  for (pair of [[0,1], [0,2],[0,3],[1,0],[2,0],[3,0]]) {
    let menuId = `menu_${pair[0]}_${pair[1]}`
    let menuForm = document.getElementById(menuId)
    let menuObj = {}
    let menuValue = menuForm.firstChild.value
    menuObj["dropdown-menu"] = menuValue
    let additionalFields = {}
    for (let f of menuForm.querySelector(".additional-fields").children) {
      if (f.name.startsWith(menuValue) && f.value) {
        additionalFields[f.name] = f.value
      }
    }
    menuObj["additional-fields"] = additionalFields
    state[menuId] = menuObj
  }
  return btoa(JSON.stringify(state))
}

function importState(encodedStateObj) {
  let stateObj = JSON.parse(atob(encodedStateObj.replaceAll("-","")))
  document.getElementById("length-slider").value = stateObj["length-slider"]
  document.getElementById("length-dropdown").value = stateObj["length-dropdown"]
  updateLengthLabel()

  for (pair of [[0,1],[0,2],[0,3],[1,0],[2,0],[3,0]]) {
    let menuId = `menu_${pair[0]}_${pair[1]}`
    let menuForm = document.getElementById(menuId)
    menuObj = stateObj[menuId]
    menuForm.firstChild.value = menuObj["dropdown-menu"]
    let additionalFields = menuForm.querySelector(".additional-fields").children
    for (let f in menuObj["additional-fields"]) {
      additionalFields.namedItem(f).value = menuObj["additional-fields"][f]
    }
    updateMenu(menuId)
  }

  updateCells()
}

drawGrid(3,3)

if (window.location.hash) {
  importState(window.location.hash.replace("#",""))
}