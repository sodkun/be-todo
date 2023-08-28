const _xlsx = require("xlsx"); 
const _xlsxPopulate = require("xlsx-populate"); 

class xlsx {
  constructor(){}
  
  //* generate excel file by raw JSON
  generateExcel(raw, filename){
    return new Promise((resolve, reject) => {
      try{
           var colLength = {};

           var newWB = _xlsx.utils.book_new();

           var newWS = _xlsx.utils.json_to_sheet(raw);
           for (let col in newWS) {
             let index = col.replace(/\d+/g, "");
             
             if (colLength[index]) {
               if (colLength[index] < (newWS[col].v || []).length) {
                 colLength[index] = (newWS[col].v || []).length;
               }
             } else {
               if (newWS[col].v) {
                 colLength[index] = (newWS[col].v || []).length;
               }
             }
             if (colLength[index] === undefined){
               colLength[index] = 3
             }
           }

           var wscols = [];
           for (let col in colLength) {
             wscols.push({
               wch: colLength[col]
             });
           }

           newWS["!cols"] = wscols;

           _xlsx.utils.book_append_sheet(newWB, newWS, "Workbook 1"); //workbook name as param
           
           _xlsx.writeFile(newWB, filename); //file name as param
           
           resolve("OK")
         }catch(err){
        console.log(err);
        reject({
          status: false,
          error: "invalid JSON"
        });
      }
    })
  }

  //* parse excel to raw JSON
  parseExcel(filename, firstCell, lastCell, password, nameSheets){
    try {
      //* Read excel file
      if(password){
        return new Promise((resolve, reject) => {
          _xlsxPopulate
          .fromFileAsync(filename, { password: password })
          .then((fileExcel) => {
            fileExcel.toFileAsync(filename+"_out").then(()=>{
              resolve(this.parseExcelWithoutPassword(filename+"_out", firstCell, lastCell, nameSheets))
            });
          }).catch(err =>{
            console.log(err)
            reject({
              status: false,
              error: err
            })
          });
        })
      }else{
        return this.parseExcelWithoutPassword(filename, firstCell, lastCell, nameSheets)
      }

    }
    catch (error) {
      console.log(error)
      return {
        status: false,
        error: error
      }
    }
  }

  search(filename, searchText, nameSheets){
      try{

        //* Read excel file
        const workbook = _xlsx.readFile(filename);

        let sheetIndex = 0 
        
        if(nameSheets){
            sheetIndex = Object.keys(workbook.Sheets).indexOf(nameSheets)
        
            if(sheetIndex < 0){
                return {
                    status: false,
                    error: `Sheet "${nameSheets}" not found`
                }
            }
        }

        //* Get first sheet on excel
        let firstSheet = workbook.Sheets[Object.keys(workbook.Sheets)[sheetIndex]];

        const results = {}
        for(let cell in firstSheet){
            if(firstSheet[cell].v){
                if(firstSheet[cell].v.toString().toLowerCase().includes(searchText.toLowerCase())){
                    results[cell] = {
                      value: firstSheet[cell].v,
                      col: cell.replace(/\d+/, ""),
                      row: parseInt(cell.replace(/[A-Z]+/, ""))
                    }
                }
            }
        }

        return {
            status: true,
            data: results
        }
      }catch (error) {
        console.log(error)
        return {
            status: false,
            error: error
        }
      }
  }

  //* parse excel to raw JSON
  parseExcelWithoutPassword(filename, firstCell, lastCell = "auto", nameSheets){
    try {

      const autoTolerance = 3;

      //* Read excel file
      const workbook = _xlsx.readFile(filename);

      let sheetIndex = 0 
      
      if(nameSheets){
          sheetIndex = Object.keys(workbook.Sheets).indexOf(nameSheets)
    
          if(sheetIndex < 0){
              return {
                  status: false,
                  error: `Sheet "${nameSheets}" not found`
              }
          }
      }

      //* Get first sheet on excel
      let firstSheet = workbook.Sheets[Object.keys(workbook.Sheets)[sheetIndex]];

      //* translate first row and column to number
      const firstCellCol = firstCell.replace(/\d+/, "");
      const firstCellRow = parseInt(firstCell.replace(/[A-Z]+/, ""));
      
      //* translate last row and column to number
      let lastCellCol, lastCellRow;

      if(lastCell != "auto"){
          lastCellCol = lastCell.replace(/\d+/, "");
          lastCellRow = parseInt(lastCell.replace(/[A-Z]+/, ""));
      }else{
          // search last filled column on table

          const groupCol = Object.keys(firstSheet).filter(cell => parseInt(cell.replace(/[A-Z]+/, "")) == firstCellRow)
    
          let lastColInInt = 0;
          let currentColInInt = 0;
          let lastCol = ""
          let currentCol = ""
          for(let col of groupCol){
            
            lastColInInt = currentColInInt;
            currentColInInt = 0;
    
            lastCol = currentCol;
            currentCol = col.replace(firstCellRow, "")
            for (let col = 0; col < currentCol.length; col++) {
                if (col > 0) {
                    currentColInInt += 26;
                }
                currentColInInt += currentCol[col].charCodeAt() - 64;
            }
    
            if(currentColInInt - lastColInInt  >= autoTolerance){
                lastCellCol = lastCol;
                break;
            }
          }


          // search last filled row on table
          const groupRow = Object.keys(firstSheet).filter(cell => cell.replace(/\d+/, "") == firstCellCol)

          let currentRow = 0;
          let lastCurrentRow = 0;
          for(let row of groupRow){
            currentRow = parseInt(row.replace(firstCellCol, ""))

            if(currentRow > firstCellRow){
                if(currentRow - lastCurrentRow >= autoTolerance ){
                    lastCellRow = lastCurrentRow
                    break
                }
            }

            lastCurrentRow = currentRow;
          }
    
      }

      let firstCellColInInt = 0;
      let lastCellColInInt = 0;

      for (let col = 0; col < firstCellCol.length; col++) {
        if (col > 0) {
          firstCellColInInt += 26;
        }
        firstCellColInInt += firstCellCol[col].charCodeAt() - 64;
      }
      for (let col = 0; col < lastCellCol.length; col++) {
        if (col > 0) {
          lastCellColInInt += 26;
        }
        lastCellColInInt += lastCellCol[col].charCodeAt() - 64;
      }


      let result = {};
      for (let cell in firstSheet) {
        //* read row and column per cell from excel file
        const currentCellRow = parseInt(cell.replace(/[A-Z]+/, ""));
        const currentCellCol = cell.replace(/\d+/, "");

        let currentColInInt = 0;

        for (let col = 0; col < currentCellCol.length; col++) {
          if (col > 0) {
            currentColInInt += 26;
          }
          currentColInInt += currentCellCol[col].charCodeAt() - 64;
        }

        //* check if cell between firstCell and lastCell
        if (
          currentColInInt >= firstCellColInInt &&
          currentColInInt <= lastCellColInInt
        ) {
          if(currentCellRow >= firstCellRow && currentCellRow <= lastCellRow){
            let getColExist = Object.keys(result).indexOf(`${currentCellRow}`);
            if(getColExist <= -1){
              result[currentCellRow] = {};
            }
            
            result[currentCellRow][currentCellCol] = firstSheet[cell].v;
          }
        }
      }
      return {
        status: true,
        result
      }
    }
    catch (error) {
      console.log(error)
      return {
        status: false,
        error: error
      }
    }
  }
}
module.exports = xlsx
