Chú ý: 
- Đây chỉ là code thực thi thông thường chạy ở môi trường MS-DOS command line của Computer
- Cách lấy địa chỉ stake của ví thì xin tự search lại trong group telegram
- Đây là truy xuất dữ liệu real-time từ blockchain nên nếu bạn chỉ có address thì không thể thực hiện được với code này.
- Bạn có thể download file này về và chạy trực tiếp mỗi lần mà không cần copy&paste (cần có quyền Admin khi chạy powerShell)  

#Bước 1: chạy Window power shell (bất kỳ Computer chạy hđh Microsoft Window đều có sẵn)
#Bước 2: Copy and paste đoạn code dưới
$url = "https://api.koios.rest/api/v1/account_info"
$headers = @{
    "accept" = "application/json"
    "content-type" = "application/json"
}

$body = @{
    "_stake_addresses" = @("Thay stakekey của ví cần check của bạn tại đây - định dạng stake1...")
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
Write-Output $response #(Enter để in kết quả)

# Bạn hoàn toàn có thể dừng ở bước này. Lưu ý các kết quả số dư thể hiện ở đơn vị Lovelace ( 1 ADA = 10^6 * Lovelace ) 
# Nếu bạn muốn chi tiết hơn để lọc các giá trị trong "response" theo ý muốn và biểu diễn theo tiếng Việt.
# Lọc các giá trị mình muốn lấy trong response

$stakeInfo = $response[0]
$stakeAddr = $stakeInfo.stake_address
$status = $stakeInfo.status
$delegatedPool = $stakeInfo.delegated_pool
$totalBalance = [math]::Round(($stakeInfo.total_balance -as [double]) * 1e-6)
$utxo = [math]::Round(($stakeInfo.utxo -as [double]) * 1e-6)
$rewards = [math]::Round(($stakeInfo.rewards -as [double]) * 1e-6)
$withdrawals = [math]::Round(($stakeInfo.withdrawals -as [double]) * 1e-6)
$rewardsAvailable = [math]::Round(($stakeInfo.rewards_available -as [double]) * 1e-6)
$emoji = "`uDBC0`uDC04"  # Emoticon '😄'

# Tạo đoạn thông điệp kết quả cuối cùng được in ra
# Bạn hoàn toàn có thể tự tạo thông điệp theo ý muốn của mình  
  
$text = "<b>Dạ! thông tin sếp cần đây ạ $emoji</b>`n"
# $text += "Pool: $delegatedPool`n"
$text += "`n"
$text += "<b>Tổng số dư</b>: $totalBalance ADA`n"
$text += "Tổng thưởng stake: $rewards ADA`n"
$text += "Đã rút thưởng: $withdrawals ADA`n"
$text += "Thưởng chưa rút: $rewardsAvailable ADA`n"
$text += "`n"
$text += "<b>Ít ADA quá, mua thêm và stake vào VIET pool nhé</b>`n"

# Display the formatted text
Write-Output $text #(Enter để in kết quả)
