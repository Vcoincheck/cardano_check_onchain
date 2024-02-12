//Đang edit/

function address_info(){
var url1 = 'https://api.koios.rest/api/v1/address_info';
var url2 = 'https://api.koios.rest/api/v1/address_assets';
var headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};
var payload = {
  '_addresses': ["Thay bằng ADDRESS bạn muốn theo dõi"]
};
var options = {
  'method': 'post',
  'headers': headers,
  'payload': JSON.stringify(payload)
};

var responseurl1 = UrlFetchApp.fetch(url1, options);
var responseurl2 = UrlFetchApp.fetch(url2, options);

  // Chuyển đổi phản hồi từ API sang đối tượng JSON
var data1 = JSON.parse(responseurl1.getContentText());
var data2 = JSON.parse(responseurl2.getContentText());
  // Lấy kết quả stake_address từ phản hồi API
var adabal = Math.round(parseFloat(data1[0].balance) * 1e-6 * 100) / 100;
var asset_info = [];
for (var i = 0; i < data2.length; i++) {
  var assetName = data2[i].asset_name;
  var quantity = data2[i].quantity;

  // Chuyển đổi assetName thành chuỗi ASCII
  var asciiAssetName = convertHexToASCII(assetName);

  // Thêm vào mảng values để sau đó ghi vào Google Sheets
  asset_info.push([asciiAssetName, quantity]);
}

  // Lọc và trả kết quả từ bảng "tên sheet của bạn"
var pot_info = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("tên sheet của bạn");
pot_info.getRange(1, 1).setValue("ADA");
pot_info.getRange(2, 1).setValue(adabal);

if (asset_info.length > 0) {
  // Ghi asset_name vào hàng đầu tiên, bắt đầu từ cột 2
  // Bạn có thể tùy chỉnh theo cách sắp xếp database của mình
  for (var i = 0; i < asset_info.length; i++) {
    pot_info.getRange(1, i + 2).setValue(asset_info[i][0]);
  }

  // Ghi quantity vào hàng thứ hai, bắt đầu từ cột 2
  for (var i = 0; i < asset_info.length; i++) {
    pot_info.getRange(2, i + 2).setValue(asset_info[i][1]);
  }
} else {
  Logger.log("Không có dữ liệu asset_info để ghi vào sheet.");
}
}
// Vì Cardano token name được mã hóa thành Hexcode nên cần hàm đổi tên token về hệ ASCII
function convertHexToASCII(hexString) {
  try {
    // Convert hex to bytes
    var bytes = [];
    for (var i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    // Create a blob from the bytes
    var blob = Utilities.newBlob(bytes);

    // Convert the blob to ASCII string
    var asciiString = blob.getDataAsString();

    Logger.log("Converted ASCII String: " + asciiString);
    return asciiString;
  } catch (error) {
    Logger.log("Error converting hex to ASCII: " + error);
    return null; // Return null if there's an error
  }
}
function appendDataToSheet(asset_name,quantity) {
  // Lấy ra bảng tính dựa trên ID
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  // Chọn sheet (nếu có nhiều sheet)
  var sheet = spreadsheet.getSheetByName("tên sheet của bạn"); // Thay "Sheet1" bằng tên của sheet trong bảng tính của bạn

  // Tạo một mảng dữ liệu để thêm vào sheet
  var data = [new Date(), asset_name, quantity]; // Tùy chỉnh theo ý của bạn ,

  // Thêm mảng dữ liệu vào sheet
  sheet.appendRow(data);
