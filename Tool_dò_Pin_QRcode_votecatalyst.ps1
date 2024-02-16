# Source-code IOHK https://github.com/input-output-hk/catalyst-core/tree/main/src/catalyst-toolbox
# Link git download tool từ IOHK https://github.com/input-output-hk/catalyst-toolbox/releases/tag/v0.5.0 chọn bản window
# Mở Window powershell. Cách mở bấm vào cửa sổ Windown, gõ power shell
# Trong màn hình Power shell hãy di chuyển tới thư mục chứa file catalyst-toolbox.exe - Ví dụ cd "tên ổ cứng":\folder\..
# Hoặc đơn giản hãy tới thư mục chứa file catalyst-toolbox.exe click chuột phải và chọn "Run in terminal"
# Copy lại toàn bộ dòng lệnh dưới đây (sửa lại 1 số giá trị như $input như trong PC của bạn) và nhấn Enter
# Có thể copy ra 1 file word để sửa lại cho đúng.

$foundValidPIN = $false
0..9 | ForEach-Object {
    $one = $_
    0..9 | ForEach-Object {
        $two = $_
        0..9 | ForEach-Object {
            $three = $_
            0..9 | ForEach-Object {
                $four = $_
                $pin = "$one$two$three$four"

                # Chạy lệnh thực thi cho catalyst-toolbox
                $input = "đường dẫn file QR"  #tới thư mục chứa file QR code, di chuyển chuột tới file, right click và chọn "Copy as path" 
                $output = .\catalyst-toolbox qr-code decode --input $input --pin $pin img 2>&1

                # Kiểm tra điều kiện nếu kết quả có chứa "Error" hay kết quả đúng
                if ($output -match "Error") {
                    Write-Output "Invalid PIN: $pin" #Bạn có thể xóa dòng này nếu không muốn thấy quá trình kiểm tra các kết quả lỗi
                }
                else {
                    Write-Output "Valid PIN: $pin"
                    Write-Output "Output: $output"
                    $foundValidPIN = $true
                    break
                }
            }
            if ($foundValidPIN) {
                break
            }
        }
        if ($foundValidPIN) {
            break
        }
    }
    if ($foundValidPIN) {
        break
    }
}
