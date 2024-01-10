//Lưu ý:
// Code chỉ nhằm mục đích: tracking biến động số dư của 1 địa chỉ cụ thể chứ không phải toàn bộ ví stake
// Nếu muốn tracking biến động của cả ví thì dùng code khác (sẽ update sau)
// Nội dung message có thể tự thay đổi theo ý muốn
// Nếu không muốn bot gửi thông báo về email và telegram group thì hãy xóa các phần code liên quan
// data trả về sheet sẽ thống kê số dư hiện tại, sự thay đổi số dư(nếu có), mã giao dịch, địa chỉ người gửi, địa chỉ stake của người gửi, tin nhắn kèm trong giao dịch (nếu có)

var spreadsheetId = "id googlesheet của bạn";
var lastUpdateTimestamp = 0;
var recipientEmail = "email bạn muốn nhận thông báo"

function soduADA() {
  // Define the recipient email
  var recipientEmail = "email bạn muốn nhận thông báo";

  // Define the Koios API URL and headers
  var koiosUrl = "https://api.koios.rest/api/v1/address_info"; // đổi api thành preview nếu muốn test code ở testnet
  var koiosHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  // Define the Koios API request body
  var koiosBody = {
    "_addresses": ["thêm address của bạn vào đây"] // lưu ý dữ liệu raw on-chain sẽ thống kê khác nhau giữa address chỉ có payment và có payment + stake
  };

  // Make the HTTP request to Koios API
  var koiosResponse = UrlFetchApp.fetch(koiosUrl, {
    method: "post",
    contentType: "application/json",
    headers: koiosHeaders,
    payload: JSON.stringify(koiosBody)
  });

  // Parse the JSON response from Koios API
  var responseData = JSON.parse(koiosResponse.getContentText());
  var addressInfo = responseData[0];

  // Extract relevant information from Koios API response
  var totalbalance = Math.round(parseFloat(addressInfo.balance) * 1e-6);
  
  var emoji = "\uD83D\uDE04"; // Emoticon '😄';
    if (responseData.length > 0) {
    var addressInfo = responseData[0];

    // Extract relevant information from Koios API response
    var totalbalance = Math.round(parseFloat(addressInfo.balance) * 1e-6);
    //var stakeaddress = addressInfo.stake_address; - lấy stake address của chính mình nếu cần


    // Thêm dữ liệu vào Google Sheet
    appendDataToSheet(totalbalance);

   
  } else {
    Logger.log("Invalid stake address format.");
  }

}
function appendDataToSheet(totalbalance,stakeaddress) {
  // Lấy ra bảng tính dựa trên ID
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  // Chọn sheet (nếu có nhiều sheet)
  var sheet = spreadsheet.getSheetByName("test12"); // Thay "Sheet1" bằng tên của sheet trong bảng tính của bạn

  // Tạo một mảng dữ liệu để thêm vào sheet
  var data = [new Date(), totalbalance]; // Nếu muốn thêm stakeaddress vào sheet thì thêm biến stakeaddress vào , ,

  // Thêm mảng dữ liệu vào sheet
  sheet.appendRow(data);

  console.log("Data appended to the sheet:", data);
}
function getDataFromSheet() {
  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName("test12");

    // Check if the sheet exists
    if (!sheet) {
      console.error("test12 'test12' not found in the spreadsheet.");
      return null;
    }

    // Check if there is data in the sheet
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      console.error("No data found in the sheet.");
      return null;
    }

    // Lấy dữ liệu từ cột B (Assuming totalbalance là cột B, chỉnh lại nếu cần thiết)
    var data = sheet.getRange(1, 2, sheet.getLastRow(), 1).getValues();
    return data;
  } catch (error) {
    console.error("Error accessing the spreadsheet:", error);
    return null;
  }
}

function compareAndPrintResults() {
  var spreadsheetId = "id googlesheet của bạn";
  var sheetName = "test12";

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();

  var message = ""; // Initialize an empty message

  // Get the values for the latest row
  var latestRow = data.length;
  var currentValue = data[latestRow - 1][1]; // Assuming values are in column B

  // Compare with the previous row
  if (latestRow > 1) {
    var previousValue = data[latestRow - 2][1];

    if (currentValue > previousValue) {
      var result = currentValue - previousValue;
        // Store the result in column C of the latest row
      sheet.getRange("C" + latestRow).setValue(result);

      // Append to the message
      message += "\n";
      message += "🤑🤑🤑 Úi trời ơi !!! Ví donate vừa được lixi : <b> " + result + " ADA 🎉🎉🎉 </b>\n";
      message += "\n";
      message += "<b> Cảm ơn sếp đã ủng hộ team 🙇🙇🙇</b>\n";
      message += "\n";
      
      // Call Koios API and append tx_hash and msg
      callKoiosAPIAndAppendTxHash(sheet, result, message);
      
    }
  }
  var emailSubject = "Thông tin sếp";
  if (message.trim() !== "") {
    MailApp.sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      htmlBody: message
    });

    // Print the final message to the console
    Logger.log("Comparison completed:\n" + message);
  } else {
    Logger.log("Message is empty. Not sending the email.");
  }
}

function callKoiosAPIAndAppendTxHash(sheet, result, message) {
  // Define the Koios API URL and headers
  var koiosUrl = "https://api.koios.rest/api/v1/address_txs";
  var koiosHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  // Define the Koios API request body
  var koiosBody = {
  "_addresses": ["thêm address của bạn vào đây"] // lưu ý dữ liệu raw on-chain sẽ thống kê khác nhau giữa address chỉ có payment và có payment + stake
  ,
  "_after_block_height": 40356
}

  // Make the HTTP request to Koios API
  var koiosResponse = UrlFetchApp.fetch(koiosUrl, {
    method: "post",
    contentType: "application/json",
    headers: koiosHeaders,
    payload: JSON.stringify(koiosBody)
  });

  // Parse the JSON response from Koios API
  var responseData = JSON.parse(koiosResponse.getContentText());

  // Check if there are any transactions
  if (responseData.length > 0) {
    // Extract tx_hash from the first transaction
    var txHash = responseData[0].tx_hash;

    // Append tx_hash to column D of the latest row
    sheet.getRange("D" + sheet.getLastRow()).setValue(txHash);

    // Log the tx_hash to the console
    Logger.log("Tx_hash:", txHash);

    // Call Tx Metadata API and append msg to column E
    callTxInfoAPI(sheet, txHash, message);
  } else {
    Logger.log("No transactions found in the response.");
  }
}

function callTxInfoAPI(sheet, txHash, message) {
  // Define the Koios API URL and headers
  var koiosUrl = "https://api.koios.rest/api/v1/tx_info";
  var koiosHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  // Define the Koios API request body
  var koiosBody = {
    "_tx_hashes": [txHash]
  };

  // Make the HTTP request to Koios API
  var koiosResponse = UrlFetchApp.fetch(koiosUrl, {
    method: "post",
    contentType: "application/json",
    headers: koiosHeaders,
    payload: JSON.stringify(koiosBody)
  });

  // Parse the JSON response from Koios API
  var responseData = JSON.parse(koiosResponse.getContentText());
  var senderstakeaddress = responseData[0].inputs[0].stake_addr;
  var senderaddress = responseData[0].inputs[0].payment_addr.bech32;
  sheet.getRange("F" + sheet.getLastRow()).setValue(senderstakeaddress);
  sheet.getRange("G" + sheet.getLastRow()).setValue(senderaddress);
  // Check if the response has metadata and msg
  var txmetadata = responseData[0].metadata;
  var msgValue = "";
  var hash_url = "https://preview.cardanoscan.io/transaction/" + txHash ;
  
  if (txmetadata === null) {
    message += "Mã giao dịch: <a href='" + hash_url + "'>hash</a> \n";
    message += "Địa chỉ stake người gửi:" + senderstakeaddress + "\n";
    message += "Địa chỉ gửi: " + senderaddress + "\n";
  } else {
    msgValue = responseData[0].metadata["674"].msg[0];
    var hash_url = "https://preview.cardanoscan.io/transaction/" + txHash;
  
    sheet.getRange("E" + sheet.getLastRow()).setValue(msgValue);

    // Append tx_hash and msg to the message
    message += "Mã giao dịch: <a href='" + hash_url + "'>hash</a> \n";
    message += "Địa chỉ stake người gửi:" + senderstakeaddress + "\n";
    message += "Địa chỉ gửi: " + senderaddress + "\n";
    message += "Tin nhắn của sếp: <b> " + msgValue + "</b>\n";
  }
  sendTelegramMessageToGroup(telegramBotToken, telegramChatId, message);

}


var telegramBotToken ="bottoken của bạn";
var telegramChatId ="telegram group chatid của bạn và bot";
function sendTelegramMessageToGroup(telegramBotToken, telegramChatId, message) {
  if (message.trim() !== "") {  // Check if the message is not empty or just whitespace
 

    var telegramApiUrl = "https://api.telegram.org/bot" + telegramBotToken + "/sendMessage";

    var payload = {
      "chat_id": telegramChatId,
      "text": message,
      "parse_mode": "HTML"
    };

    // Make the HTTP request to send the message
    var response = UrlFetchApp.fetch(telegramApiUrl, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload)
    });

    // Log the response to check for errors
    console.log(response.getContentText());
  } else {
    console.log("Message is empty. Not sending to Telegram.");
  }
}

// Lấy dữ liệu từ sheet
var sheetData = getDataFromSheet();

// So sánh và gửi thông báo nếu có thay đổi
compareAndPrintResults(sheetData);




