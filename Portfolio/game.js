let gameTable = document.getElementById("gameTable");
let selectors = document.getElementById("selectorTable").rows[0].children;

let turn = "red"



function reset() {
  turn = "red";
  for (let selector of selectors) {
    selector.onmouseover = function() {
      hover(selector.id);
    }
    selector.onclick = function() {
      click(selector.id);
    }
    selector.classList.add("available");
    selector.classList.remove("black");
    selector.classList.add(turn);
  }

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      getCell(i, j).innerHTML = "";
    }
  }
}

reset();



function hover(col) {
  //not currently needed
}

function click(col) {
  if (selectors[col].classList.contains("available")) {
    let row = calcLowest(col);
    if (turn == "red") {
      setRed(row, col);
      turn = "black";
      for (let selector of selectors) {
        selector.classList.replace("red","black");
      }
    } else if (turn == "black") {
      setBlack(row, col);
      turn = "red";
      for (let selector of selectors) {
        selector.classList.replace("black","red");
      }
    }
  }
  update();
  let winner = checkWin();
  if (winner) {
    for (let selector of selectors) {
      selector.classList.remove("available");
    }
    setTimeout(function() {
      alert(winner + " wins!");
    }, 1000)

    //console.log(winner + " win's!");
  }
}

function update() {
  for (let j = 0; j < 7; j++) {
    if (calcLowest(j) < 0) {
      selectors[j].classList.remove("available");
    }
  }
}

function getState(row, col) {
  let cell = getCell(row, col);
  if (cell.innerHTML == "") {
    return false;
  } else if (cell.children[0].classList.contains("red")) {
    return "red";
  } else if (cell.children[0].classList.contains("black")) {
    return "black";
  }
}

function checkWin() {
  //Horiz
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      for (let side of ["red", "black"]) {
        if (getState(i, j) == side &&
            getState(i, j+1) == side &&
            getState(i, j+2) == side &&
            getState(i, j+3) == side) {
          return side
        }
      }
    }
  }

  //Vert
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 7; j++) {
      for (let side of ["red", "black"]) {
        if (getState(i, j) == side &&
            getState(i+1, j) == side &&
            getState(i+2, j) == side &&
            getState(i+3, j) == side) {
          return side;
        }
      }
    }
  }

  //Slant down \
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      for (let side of ["red", "black"]) {
        if (getState(i, j) == side &&
            getState(i+1, j+1) == side &&
            getState(i+2, j+2) == side &&
            getState(i+3, j+3) == side) {
          return side;
        }
      }
    }
  }

  //Slant up /
  for (let i = 3; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      for (let side of ["red", "black"]) {
        if (getState(i, j) == side &&
            getState(i-1, j+1) == side &&
            getState(i-2, j+2) == side &&
            getState(i-3, j+3) == side) {
          return side;
        }
      }
    }
  }
  return false;
}

function calcLowest(col) {
  for (let i = 5; i >= 0; i--) {
    if (getCell(i, col).innerHTML == "") {
      return i;
    }
  }
  return -1
}

function getCell(row, col) {
  return gameTable.rows[row].children[col]
}

function setRed(row, col) {
  getCell(row,col).innerHTML = '<div class="red"></div>';
}

function setBlack(row, col) {
  getCell(row,col).innerHTML = '<div class="black"></div>';
}
