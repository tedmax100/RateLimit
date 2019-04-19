# RateLimit 
------------------------
## 需求描述
* 每個 IP 每分鐘僅能接受 60 個 requests
* 在首頁顯示目前的 request 量,超過限制的話則顯示 “Error”,例如在一分鐘內第 30 個 request 則顯示 30,第 61 個
* request 則顯示 Error
* 可以使用任意資料庫,也可以自行設計 in-memory 資料結構,並在文件中說明理由
* 請附上測試
* 請不要使用任何現成的 rate limit library

## 資料庫
使用Redis, 原因是當server有多台做LB架構時, 需要共享這些請求資訊。
以及透過Redis的單執行緒的特性，和Lua做邏輯處理，做這樣處理很適合。
關聯式資料庫要做需要特別處理RaceCondition議題。

這次資料結構我使用SortedSet，以IP當Key, 當下的請求時間做Value和Score。方便我計算有幾筆資料，和移除過期的資料。

## 使用方式
1. 修改config.json的redis host、port、db
2. 安裝依賴套件
```
npm install
```
3. run test
```
npm test
```
4. start server
```
npm start
```